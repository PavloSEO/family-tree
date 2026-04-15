# 11 — Deployment

---

## Docker (overview)

By default the root **`docker-compose.yml`** starts **two** services:

| Service | Role |
|--------|------|
| **`family-tree`** | Built from root **`Dockerfile`**: Node 22, Hono, SQLite, Sharp; listens on **3000** **inside** Docker only (no host port, to avoid clashing with local `pnpm run dev:server`). |
| **`nginx`** | Image from **`docker/nginx/`**: reverse proxy **host `8080` → container `80` → upstream `family-tree:3000`**. Dev machine: **http://localhost:8080**. |

**Required:** set **`JWT_SECRET`** in root **`.env`** (≥ 32 characters). Otherwise `docker compose` will fail variable substitution (see `docker-compose.yml`).

### Quick start (local)

```bash
cp .env.example .env
# Set JWT_SECRET (openssl rand -hex 32) and ADMIN_PASSWORD
mkdir -p data/db data/photos data/backups
docker compose up -d --build
curl -s http://localhost:8080/health
```

Logs: **`docker compose logs -f family-tree`**, **`docker compose logs -f nginx`**. Stop: **`docker compose down`**.

**Production on a VPS:** when port **80** is free, under **`nginx`** in **`docker-compose.yml`** change **`"8080:80"`** to **`"80:80"`** (and configure TLS if needed — see Caddy below).

**Direct API access without nginx:** under **`family-tree`** add **`ports: ["3000:3000"]`** (or use **`docker-compose.override.yml`**, not committed).

### App Dockerfile (multi-stage)

```
Stage 1 (deps):     node:22-alpine + pnpm install --frozen-lockfile
Stage 2 (builder):  pnpm build client + server + pnpm prune --prod
Stage 3 (runner):   node:22-alpine + vips-dev (for sharp)
                    Copy /app, entrypoint, backup cron
                    CMD: node dist/serve.js (migrations + seed via bootstrap)
```

### Nginx in this repo

- **`docker/nginx/Dockerfile`** — `nginx:1.27-alpine`, replace **`/etc/nginx/nginx.conf`** with **`docker/nginx/family-tree.conf`**.
- **`docker/nginx/family-tree.conf`** — single **`http{}`**: gzip, **`merge_slashes`**, **`client_max_body_size`**, **upstream** to **`family-tree:3000`**. Two **`server`** blocks on **80**: first — **301** from **`www.`** to same host **without** `www` (canonical URL); redirect scheme respects **`X-Forwarded-Proto`** behind TLS terminator. Second — **`default_server`**, **`proxy_pass`** to the app, **`X-Forwarded-*`**, **`Upgrade`** for WebSocket.
- **`docker/nginx/README.md`** — details, **www**→apex, **SSL** options (Caddy, certs volume, external balancer).

### Startup (`bootstrap.ts`)

When **`node dist/serve.js`** runs, **`bootstrap.ts`** (from `index.ts`) does:

1. **`runMigrate()`** — apply Drizzle SQL migrations to the SQLite file (**`DATABASE_PATH`** / **`DB_PATH`**).
2. If **`SKIP_DB_SEED` ≠ `1`** — **`runSeed()`**: if no user with role **admin**, create first admin from **`ADMIN_LOGIN`** / **`ADMIN_PASSWORD`**; otherwise no-op.

Container logs show **`[bootstrap] ...`** lines (including when **`SKIP_DB_SEED=1`**).

### Browser cache (production SPA)

**`static-spa.ts`** serves **`packages/client/dist`** (`NODE_ENV=production`):

- paths under **`/assets/`** — **`Cache-Control: public, max-age=31536000, immutable`** (Vite-hashed filenames);
- **`index.html`** (as file) and **SPA fallback** — **`Cache-Control: no-cache`** and **`Pragma: no-cache`** so a new shell loads after deploy;
- other **`dist`** assets (e.g. favicon) — default ~1 day.

### Security headers (CSP, nosniff)

The Hono app sets headers from **`packages/server/src/middleware/security-headers.ts`**, including **`Content-Security-Policy`** and **`X-Content-Type-Options: nosniff`**. Details and **`CSP_CONNECT_SRC_EXTRA`** (static vs API on different origins) — **`docs/07-auth.md`** (“Security headers”).

If a reverse proxy (Caddy, nginx) sits in front of Node, avoid duplicating conflicting CSP: either keep policy on the app or move to the proxy and disable on the app in a dedicated change.

### Shutdown (SIGINT / SIGTERM)

In **`serve.ts`**: on **SIGINT** / **SIGTERM** call **`server.close()`**, then **`sqlite.close()`**; if close hangs — force exit after **10 s**. A second signal during shutdown exits immediately.

**`docker-compose.yml`** sets **`stop_grace_period: 15s`** for **`family-tree`** so Docker does not send **SIGKILL** before the internal timeout.

### docker-compose.yml (as in repo)

Below is the current shape (two services). App env vars in **`environment:`**; **`JWT_SECRET`** from host **`.env`**.

```yaml
services:
  family-tree:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: family-tree
    stop_grace_period: 15s
    restart: unless-stopped
    expose:
      - "3000"
    volumes:
      - ./data/db:/data/db
      - ./data/photos:/data/photos
      - ./data/backups:/data/backups
    environment:
      NODE_ENV: production
      PORT: "3000"
      DATABASE_PATH: /data/db/family-tree.db
      PHOTOS_PATH: /data/photos
      BACKUPS_PATH: /data/backups
      ENABLE_BACKUP_CRON: "1"
      JWT_SECRET: ${JWT_SECRET:?Set JWT_SECRET in .env}
      ADMIN_LOGIN: ${ADMIN_LOGIN:-admin}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD:-changeme}
      RATE_LIMIT_MAX_ATTEMPTS: ${RATE_LIMIT_MAX_ATTEMPTS:-5}
      RATE_LIMIT_WINDOW_MINUTES: ${RATE_LIMIT_WINDOW_MINUTES:-15}

  nginx:
    build:
      context: ./docker/nginx
      dockerfile: Dockerfile
    container_name: family-tree-nginx
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - family-tree
```

You can assemble a separate compose with **only** the app and **Caddy** for HTTPS (no repo nginx) — the default here is **family-tree + nginx**.

### Caddyfile

The repo root **`Caddyfile`** matches the example below; mount into the Caddy container and replace the hostname.

```
tree.example.com {
    reverse_proxy family-tree:3000
}
```

Caddy obtains a Let’s Encrypt certificate automatically. Replace `tree.example.com` with your domain.

### Automatic backups in the container

With **`ENABLE_BACKUP_CRON=1`** (default in `docker-compose.yml`) the entrypoint starts **`crond`** and loads **`/etc/crontabs/root`**:

- **03:00** daily (container time, usually UTC) runs **`scripts/docker-backup-run.sh`**.
- The script deletes **`*.tar.gz`** in **`BACKUPS_PATH`** older than **30** days (`find … -mtime +30`), then runs **`node dist/backup-cli.js`** (same as **`POST /api/backup`**: tar.gz with DB and photos).
- Before packing photos, **symlinks** are checked: if a link points **outside** **`PHOTOS_PATH`**, backup **aborts** (path traversal guard).
- Cron log: **`/data/backups/cron.log`** (volume `./data/backups`).

Disable cron: **`ENABLE_BACKUP_CRON=0`** on the service.

## VPS (example host)

### Minimum requirements

| Resource | Minimum | Recommended |
|--------|---------|-------------|
| RAM | 512 MB | 1 GB |
| CPU | 1 vCPU | 1 vCPU |
| Disk | 10 GB | 20 GB (depends on photos) |
| OS | Ubuntu 22.04+ | Ubuntu 24.04 LTS |

### Memory use (rough)

| Component | RAM |
|-----------|-----|
| Node.js (Hono + SQLite) | 80–120 MB |
| Nginx (reverse proxy) | ~5–15 MB |
| Caddy (if used separately) | 10–15 MB |
| Docker overhead | 20–30 MB |
| Total (default compose) | ~130–180 MB |

### Install

```bash
# 1. Docker
curl -fsSL https://get.docker.com | sh

# 2. Project
mkdir -p /opt/family-tree && cd /opt/family-tree
git clone <repo> .

# 3. Env
cp .env.example .env
nano .env
# JWT_SECRET=$(openssl rand -hex 32)
# ADMIN_PASSWORD=<strong password>

# 4. Data
mkdir -p data/db data/photos data/backups

# 5. DNS
# A record: tree.example.com -> VPS IP

# 6. Run
docker compose up -d --build

# 7. Check (default nginx maps 8080; on VPS use 80:80 or Caddy)
docker compose logs -f
curl -s http://127.0.0.1:8080/health
# With TLS via Caddy on 443:
# curl -fsS https://tree.example.com/health
```

### Update

```bash
cd /opt/family-tree
git pull
docker compose up -d --build
```

Data in volumes (`data/`) survives image rebuilds.

## Environment variables

| Variable | Required | Default | Description |
|-----------|-------------|---------|----------|
| JWT_SECRET | yes | — | JWT secret (min 32 chars) |
| ADMIN_LOGIN | no | admin | Admin login (seed) |
| ADMIN_PASSWORD | no | changeme | Admin password (seed) |
| PORT | no | 3000 | Server port |
| DATABASE_PATH | no | see compose | SQLite path in container (**`/data/db/family-tree.db`** in compose) |
| DB_PATH | no | — | Alias for **DATABASE_PATH** (see `.env.example`) |
| PHOTOS_PATH | no | /data/photos | Photos directory |
| BACKUPS_PATH | no | /data/backups | Backups directory |
| ENABLE_BACKUP_CRON | no | 0 | In **`docker-compose.yml`** default **1**: cron + 30-day rotation (see above) |
| SESSION_TTL_DAYS | no | 30 | JWT “Remember me” TTL |
| MAX_UPLOAD_SIZE_MB | no | 10 | Max photo upload size |
| RATE_LIMIT_MAX_ATTEMPTS | no | 5 | Login attempts (window below) |
| RATE_LIMIT_WINDOW_MINUTES | no | 15 | Login rate-limit window |
| API_MUTATE_RATE_LIMIT_MAX | no | 400 | Max API mutations (POST/PUT/PATCH/DELETE) per IP per window below; excludes `POST /api/auth/login` |
| API_MUTATE_RATE_LIMIT_WINDOW_MINUTES | no | 15 | Mutation rate-limit window (in-memory) |
| SKIP_DB_SEED | no | 0 | If **`1`**, **`runSeed()`** skipped on start (migrations still run); admin must exist |

## Password reset via CLI

Inside the container (or on the host with the same **`DATABASE_PATH`**) after building the server, **`dist/admin-password-cli.js`** is available.

1. Stop traffic or briefly stop the container if you worry about races (optional for single-writer SQLite).
2. Example for default seed login **`admin`**:

```bash
docker compose exec -e NEW_ADMIN_PASSWORD='NewPassword123' family-tree \
  node dist/admin-password-cli.js
```

Working directory in the container — **`/app/packages/server`** (see Dockerfile).

Another login:

```bash
docker compose exec -e NEW_ADMIN_PASSWORD='...' family-tree \
  node dist/admin-password-cli.js --login=other_user
```

Locally (dev): **`pnpm --filter @family-tree/server exec tsx src/admin-password-cli.ts`** with **`DATABASE_PATH`** / **`DB_PATH`** and **`NEW_ADMIN_PASSWORD`** set.

Password: at least **8** characters (same as users API).

## SPA in production

With **`NODE_ENV=production`** the server serves **`packages/client/dist`** and for paths outside **`/api`** / **`/health`** responds with **`index.html`** (client routing). The Docker build already runs **`pnpm --filter @family-tree/client build`**.
