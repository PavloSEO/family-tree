# Nginx for Family Tree

Reverse proxy in front of the **`family-tree`** container (Hono + built React SPA). Image **`nginx:1.27-alpine`**, no extra modules.

## Files

| File | Purpose |
|------|---------|
| **`Dockerfile`** | Replaces **`/etc/nginx/nginx.conf`** with **`family-tree.conf`**. |
| **`family-tree.conf`** | Full `nginx.conf`: **gzip**, **`client_max_body_size`**, **upstream** `family-tree:3000`, **`www.*` → apex** redirect, **`merge_slashes`**, **`proxy_pass`** with **`X-Forwarded-*`** and WebSocket **Upgrade**. |

## URL behavior

- Request to **`www.example.com`** → **301** to the same path without the **`www.`** prefix (canonical host). Redirect scheme uses **`X-Forwarded-Proto`** (when TLS terminates in front) or **`$scheme`**.
- **`merge_slashes on`** — collapses duplicate **`//`** in the URI.

## SSL / HTTPS in Docker

By default **`docker-compose.yml`** publishes nginx **port 80** only (**8080** on the host). HTTPS options:

### 1. Caddy (good on a VPS, Let's Encrypt)

Run a separate **Caddy** container (or use the pattern in **`docs/11-deployment.md`**) with the root **`Caddyfile`**: `reverse_proxy` to **`family-tree-nginx:80`** or directly to **`family-tree:3000`**. Caddy obtains certificates automatically. You can keep internal nginx on **80** only between containers.

### 2. TLS on this nginx

1. Obtain certificates (Let's Encrypt **certbot**, provider, manual copy) on the host, e.g. **`./docker/nginx/certs/`** with **`fullchain.pem`** and **`privkey.pem`** (do not commit keys).
2. Under the **`nginx`** service in **`docker-compose.yml`**, add port **`443:443`** and a volume:
   ```yaml
   volumes:
     - ./docker/nginx/certs:/etc/nginx/certs:ro
   ```
3. In **`family-tree.conf`**, add a second **`server`** block with **`listen 443 ssl`**, **`ssl_certificate` / `ssl_certificate_key`**, the same **`proxy_pass`** to **`family_tree_app`**, and optionally the same **www** redirect for **443**. Official guide: [HTTPS in nginx](https://nginx.org/en/docs/http/configuring_https_servers.html).
4. For **HTTP → HTTPS**, add to the **80** **`server`** `return 301 https://$host$request_uri;` (or only for production hostnames) once **443** is configured.

### 3. External load balancer

Cloud / host nginx terminates TLS and forwards **HTTP** to the container with **`X-Forwarded-Proto: https`** — the current config uses that for **www** redirects.

## Run

From the repo root: **`docker compose up -d --build`**. App: **http://localhost:8080**. Publishing app **3000** on the host — see comments in **`docker-compose.yml`**.
