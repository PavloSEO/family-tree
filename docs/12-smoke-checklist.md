# 12 — Manual smoke checklist

After **`docker compose up --build`** or locally **`pnpm`** build + server + client dev.

## 1. Build and container

| Step | Action | Expected |
|-----|----------|----------|
| 1.1 | `docker compose up --build -d` (or locally: server `NODE_ENV=production` + client `build` + `node dist/serve.js`) | Container **healthy**, port **3000** |
| 1.2 | `curl -s http://localhost:3000/health` | `{"status":"ok"}` |
| 1.3 | Open `http://localhost:3000/` in the browser | SPA: login page or app |

## 2. Auth

| Step | Action | Expected |
|-----|----------|----------|
| 2.1 | Log in as admin from **`.env`** / compose | Redirect to home / welcome |
| 2.2 | Sign out and sign in again with “Remember me” | Session restored |
| 2.3 | Wrong password | Error message |

## 3. CRUD (admin)

| Step | Action | Expected |
|-----|----------|----------|
| 3.1 | **Cards**: create, open, edit, delete (test card) | No 500 |
| 3.2 | **Links**: create a link between two cards | Validation on duplicates |
| 3.3 | **Users** (if not only admin): create viewer | 201 |
| 3.4 | **Settings**: change site title, save | 200 |
| 3.5 | **Backup**: create, download, delete file | tar.gz downloads |

## 4. Tree

| Step | Action | Expected |
|-----|----------|----------|
| 4.1 | Open **Tree** with root from a card | Nodes, panel, zoom |
| 4.2 | Double-click a node | Rebuild from selected person |

## 5. Photo albums and card

| Step | Action | Expected |
|-----|----------|----------|
| 5.1 | Album: upload photo | Preview |
| 5.2 | **PersonPage**: infographics / contacts when data exists | Renders |

## 6. Viewer

| Step | Action | Expected |
|-----|----------|----------|
| 6.1 | Log in as **viewer** | No admin sections in menu |
| 6.2 | Tree and albums | Access allowed |

---

**VPS deploy:** follow **`docs/11-deployment.md`** (Docker, DNS, Caddy if needed). After deploy, repeat steps **1.2–2.1** on the production URL.
