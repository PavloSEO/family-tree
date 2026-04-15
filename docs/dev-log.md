# Журнал изменений по репозиторию (кратко)

Один файл вместо каталога `log/`: этапы разработки по-прежнему в **`ROADMAP.md`**, детали фич — в **`docs/`**.

## 2026-04 — сопровождение перед/после публикации на GitHub

- **GitHub:** ссылка на репозиторий в `README`, метаданные в корневом `package.json`, `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, CI (`.github/workflows/ci.yml`), скрипт **`pnpm run typecheck`**.
- **Мусор из git:** удалены/игнорируются `log/`, `log.zip`, `material-web-main/` (см. `.gitignore` и `CONTRIBUTING.md`). Проект собирается с **`@material/web`** из npm.
- **Аудит:** пункты по коду (Lucide в контактах, два слайдера глубины дерева, toasts в админке и т.д.) закрыты; хвост задач — в **`ROADMAP.md`** → раздел **«Остаток по аудиту»**; файл `to-do/AUDIT.md` не используется.
- **Docker:** образ собирается командой **`docker compose build`** (проверено на Windows + Docker Desktop); для **`docker compose up`** нужен **`JWT_SECRET`** в `.env` (см. `docker-compose.yml`, `docs/11-deployment.md`).

## i18n (ru / en)

Реализовано на клиенте; план и чек-лист для разработчиков — **`docs/i18n-client.md`**. Краткая пометка в **`to-do/i18n-ru-en.md`**.
