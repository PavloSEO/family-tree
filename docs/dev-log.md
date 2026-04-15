# Repository change log (short)

Single file instead of a `log/` directory: development phases remain in **`ROADMAP.md`**, feature details in **`docs/`**.

## 2026-04 — maintenance before / after GitHub publication

- **GitHub:** repo link in `README`, metadata in root `package.json`, `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, CI (`.github/workflows/ci.yml`), **`pnpm run typecheck`** script.
- **Git cleanup:** removed / ignored `log/`, `log.zip`, `material-web-main/` (see `.gitignore` and `CONTRIBUTING.md`). The project builds with **`@material/web`** from npm.
- **Audit:** code items (Lucide in contacts, two tree depth sliders, admin toasts, etc.) closed; remaining work in **`ROADMAP.md`** → **“Audit follow-ups”**; `to-do/AUDIT.md` is not used.
- **Docker:** image builds with **`docker compose build`** (verified on Windows + Docker Desktop); for **`docker compose up`** set **`JWT_SECRET`** in `.env` (see `docker-compose.yml`, `docs/11-deployment.md`).

## i18n (ru / en)

Implemented on the client; developer plan and checklist — **`docs/i18n-client.md`**. Short note in **`to-do/i18n-ru-en.md`**.
