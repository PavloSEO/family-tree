# 11 -- Деплой

---

## Docker

Один контейнер, один процесс (Hono на Node.js).

### Dockerfile (multi-stage)

```
Stage 1 (deps):     node:22-alpine + pnpm install --frozen-lockfile
Stage 2 (builder):  pnpm build shared -> client -> server
Stage 3 (runner):   node:22-alpine + apk add vips-dev (для sharp)
                    Копируем: server/dist, client/dist, shared/dist, node_modules
                    CMD: node dist/serve.js (миграции и опциональный сид при импорте bootstrap.ts)
```

### Старт процесса (`bootstrap.ts`)

При запуске **`node dist/serve.js`** модуль **`bootstrap.ts`** (подключается из `index.ts`) выполняет по порядку:

1. **`runMigrate()`** — применение SQL-миграций Drizzle к файлу SQLite (**`DATABASE_PATH`** / **`DB_PATH`**).
2. Если **`SKIP_DB_SEED` ≠ `1`** — **`runSeed()`**: при отсутствии пользователя с ролью **admin** создаётся первый admin из **`ADMIN_LOGIN`** / **`ADMIN_PASSWORD`**; иначе выход без изменений.

В лог контейнера пишутся строки **`[bootstrap] ...`** (в т.ч. при **`SKIP_DB_SEED=1`**).

### Кэш браузера (production SPA)

Файлы из **`packages/client/dist`** отдаёт **`static-spa.ts`** (`NODE_ENV=production`):

- пути с **`/assets/`** — **`Cache-Control: public, max-age=31536000, immutable`** (у Vite в имени есть хэш);
- **`index.html`** (как файл) и **SPA fallback** — **`Cache-Control: no-cache`** и **`Pragma: no-cache`**, чтобы после деплоя подтянулась новая оболочка;
- остальное из **`dist`** (например, favicon) — по умолчанию сутки.

### Заголовки безопасности (CSP, nosniff)

Приложение Hono выставляет ответам заголовки из **`packages/server/src/middleware/security-headers.ts`**: в том числе **`Content-Security-Policy`** и **`X-Content-Type-Options: nosniff`**. Подробный разбор и **`CSP_CONNECT_SRC_EXTRA`** (если статика и API на разных origin) — в **`docs/07-auth.md`** (раздел «Заголовки безопасности»).

Если перед Node стоит reverse proxy (Caddy, nginx), не дублируйте конфликтующий CSP без необходимости: либо оставьте политику на приложении, либо перенесите на прокси и отключите на приложении отдельной задачей.

### Остановка процесса (SIGINT / SIGTERM)

В **`serve.ts`**: по **SIGINT** / **SIGTERM** вызывается **`server.close()`**, затем **`sqlite.close()`**; при зависании закрытия — принудительный выход через **10 с**. Повторный сигнал во время остановки завершает процесс сразу.

В **`docker-compose.yml`** для сервиса задан **`stop_grace_period: 15s`**, чтобы Docker не послал **SIGKILL** раньше внутреннего таймаута.

### docker-compose.yml

В корне репозитория переменная **`JWT_SECRET`** передаётся в контейнер только из `.env` / окружения хоста: при пустом или отсутствующем значении **`docker compose`** завершится с ошибкой подстановки (нет небезопасного дефолта). Длина **≥ 32** символов дополнительно проверяется кодом сервера при логине.

```yaml
services:
  family-tree:
    build: .
    container_name: family-tree
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data/db:/data/db
      - ./data/photos:/data/photos
      - ./data/backups:/data/backups
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_LOGIN=${ADMIN_LOGIN:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
      - DB_PATH=/data/db/family-tree.db
      - PHOTOS_PATH=/data/photos
      - BACKUPS_PATH=/data/backups
      - SESSION_TTL_DAYS=30
      - MAX_UPLOAD_SIZE_MB=10

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - family-tree

volumes:
  caddy_data:
  caddy_config:
```

### Caddyfile

В корне репозитория лежит файл **`Caddyfile`** (тот же пример, что ниже); при монтировании в контейнер Caddy подставьте свой домен.

```
tree.example.com {
    reverse_proxy family-tree:3000
}
```

Caddy автоматически получает Let's Encrypt сертификат. Менять `tree.example.com` на реальный домен.

### Автоматические бэкапы в контейнере

При **`ENABLE_BACKUP_CRON=1`** (по умолчанию в `docker-compose.yml`) entrypoint запускает **`crond`** и подхватывает **`/etc/crontabs/root`**:

- **03:00** каждый день (время контейнера, обычно UTC) выполняется **`scripts/docker-backup-run.sh`**.
- Скрипт удаляет файлы **`*.tar.gz`** в **`BACKUPS_PATH`**, старше **30** дней (`find … -mtime +30`), затем вызывает **`node dist/backup-cli.js`** (тот же код, что и **`POST /api/backup`**: tar.gz с БД и каталогом фото).
- Перед упаковкой фото проверяются **симлинки**: если ссылка указывает **вне** каталога **`PHOTOS_PATH`**, бэкап **прерывается** с ошибкой (защита от обхода корня).
- Лог cron: **`/data/backups/cron.log`** (volume `./data/backups`).

Отключить cron: **`ENABLE_BACKUP_CRON=0`** в окружении сервиса.

## VPS (cloudvps.by)

### Минимальные требования

| Ресурс | Минимум | Рекомендация |
|--------|---------|-------------|
| RAM | 512 МБ | 1 ГБ |
| CPU | 1 vCPU | 1 vCPU |
| Disk | 10 ГБ | 20 ГБ (зависит от фото) |
| OS | Ubuntu 22.04+ | Ubuntu 24.04 LTS |

### Потребление

| Компонент | RAM |
|-----------|-----|
| Node.js (Hono + SQLite) | 80-120 МБ |
| Caddy | 10-15 МБ |
| Docker overhead | 20-30 МБ |
| Итого | ~130-170 МБ |

### Установка

```bash
# 1. Docker
curl -fsSL https://get.docker.com | sh

# 2. Проект
mkdir -p /opt/family-tree && cd /opt/family-tree
git clone <repo> .

# 3. Env
cp .env.example .env
nano .env
# JWT_SECRET=$(openssl rand -hex 32)
# ADMIN_PASSWORD=<strong password>

# 4. Данные
mkdir -p data/db data/photos data/backups

# 5. DNS
# A-запись: tree.example.com -> IP VPS

# 6. Запуск
docker compose up -d --build

# 7. Проверка
docker compose logs -f
curl -k https://tree.example.com
```

### Обновление

```bash
cd /opt/family-tree
git pull
docker compose up -d --build
```

Данные в volumes (`data/`) не теряются при пересборке контейнера.

## Environment variables

| Переменная | Обязательная | Default | Описание |
|-----------|-------------|---------|----------|
| JWT_SECRET | да | -- | Секрет для JWT (min 32 символа) |
| ADMIN_LOGIN | нет | admin | Логин админа (seed) |
| ADMIN_PASSWORD | нет | changeme | Пароль админа (seed) |
| PORT | нет | 3000 | Порт сервера |
| DB_PATH | нет | /data/db/family-tree.db | Путь к SQLite |
| PHOTOS_PATH | нет | /data/photos | Директория фото |
| BACKUPS_PATH | нет | /data/backups | Директория бэкапов |
| ENABLE_BACKUP_CRON | нет | 0 | В **`docker-compose.yml`** по умолчанию **1**: cron + ротация 30 дней (см. раздел выше) |
| SESSION_TTL_DAYS | нет | 30 | TTL JWT «Запомнить» |
| MAX_UPLOAD_SIZE_MB | нет | 10 | Макс. размер загрузки фото |
| RATE_LIMIT_MAX_ATTEMPTS | нет | 5 | Попытки логина (окно ниже) |
| RATE_LIMIT_WINDOW_MINUTES | нет | 15 | Окно rate limit логина |
| API_MUTATE_RATE_LIMIT_MAX | нет | 400 | Макс. мутаций API (POST/PUT/PATCH/DELETE) с одного IP за окно ниже; не считает `POST /api/auth/login` |
| API_MUTATE_RATE_LIMIT_WINDOW_MINUTES | нет | 15 | Окно для лимита мутаций (in-memory) |
| SKIP_DB_SEED | нет | 0 | Если **`1`**, при старте не вызывается **`runSeed()`** (миграции остаются); admin должен быть в БД заранее |

## Сброс пароля через CLI

В контейнере (или на хосте с тем же **`DATABASE_PATH`**) после сборки сервера есть бандл **`dist/admin-password-cli.js`**.

1. Остановите трафик или кратко остановите контейнер, если боитесь гонок (необязательно для SQLite при одном писателе).
2. Выполните (пример для логина по умолчанию **`admin`** из seed):

```bash
docker compose exec -e NEW_ADMIN_PASSWORD='НовыйПароль123' family-tree \
  node dist/admin-password-cli.js
```

Рабочая директория контейнера — **`/app/packages/server`** (см. Dockerfile).

Другой логин:

```bash
docker compose exec -e NEW_ADMIN_PASSWORD='...' family-tree \
  node dist/admin-password-cli.js --login=имя_пользователя
```

Локально (dev): **`pnpm --filter @family-tree/server exec tsx src/admin-password-cli.ts`** при установленных **`DATABASE_PATH`** / **`DB_PATH`** и **`NEW_ADMIN_PASSWORD`**.

Пароль: не короче **8** символов (как в API пользователей).

## SPA в production

При **`NODE_ENV=production`** сервер отдаёт файлы из **`packages/client/dist`** и для путей вне **`/api`** / **`/health`** отвечает **`index.html`** (клиентский роутинг). Сборка Docker уже выполняет **`pnpm --filter @family-tree/client build`**.
