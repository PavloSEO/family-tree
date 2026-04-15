# 11 -- Деплой

---

## Docker (обзор)

По умолчанию в корневом **`docker-compose.yml`** поднимаются **два** сервиса:

| Сервис | Роль |
|--------|------|
| **`family-tree`** | Сборка из корневого **`Dockerfile`**: Node 22, Hono, SQLite, Sharp; слушает **3000** только **внутри** сети Docker (на хост порт не пробрасывается, чтобы не конфликтовать с локальным `pnpm run dev:server`). |
| **`nginx`** | Образ из **`docker/nginx/`**: reverse proxy **хост `8080` → контейнер `80` → upstream `family-tree:3000`**. Сайт с машины разработчика: **http://localhost:8080**. |

**Обязательно:** в **`.env`** в корне задать **`JWT_SECRET`** (≥ 32 символов). Иначе `docker compose` не подставит секрет и завершится с ошибкой (см. подстановку в `docker-compose.yml`).

### Быстрый старт (локально)

```bash
cp .env.example .env
# Заполните JWT_SECRET (openssl rand -hex 32) и ADMIN_PASSWORD
mkdir -p data/db data/photos data/backups
docker compose up -d --build
curl -s http://localhost:8080/health
```

Логи: **`docker compose logs -f family-tree`**, **`docker compose logs -f nginx`**. Остановка: **`docker compose down`**.

**Продакшен на VPS:** когда порт **80** свободен, в **`docker-compose.yml`** у сервиса **`nginx`** замените **`"8080:80"`** на **`"80:80"`** (и при необходимости настройте TLS — см. ниже про Caddy).

**Прямой доступ к API без nginx:** под сервисом **`family-tree`** добавьте **`ports: ["3000:3000"]`** (или используйте **`docker-compose.override.yml`**, не коммитимый в git).

### Dockerfile приложения (multi-stage)

```
Stage 1 (deps):     node:22-alpine + pnpm install --frozen-lockfile
Stage 2 (builder):  pnpm build client + server + pnpm prune --prod
Stage 3 (runner):   node:22-alpine + vips-dev (для sharp)
                    Копируется /app, entrypoint, cron для бэкапов
                    CMD: node dist/serve.js (миграции и сид через bootstrap)
```

### Nginx в репозитории

- **`docker/nginx/Dockerfile`** — `nginx:1.27-alpine`, подмена **`/etc/nginx/nginx.conf`** на **`docker/nginx/family-tree.conf`**.
- **`docker/nginx/family-tree.conf`** — один `server` на 80, `proxy_pass` на **`http://family-tree:3000`**, gzip, **`client_max_body_size 20m`**, заголовки **`X-Forwarded-*`**, поддержка **`Upgrade`** для WebSocket.
- **`docker/nginx/README.md`** — откуда взялся пример (архив с конфигами под другой стек); в git **не** коммитится **`nginx.zip`** (см. **`.gitignore`**).

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

В **`docker-compose.yml`** для сервиса **`family-tree`** задан **`stop_grace_period: 15s`**, чтобы Docker не послал **SIGKILL** раньше внутреннего таймаута.

### docker-compose.yml (как в репозитории)

Ниже — актуальная схема (два сервиса). Переменные окружения приложения задаются в **`environment:`**; **`JWT_SECRET`** берётся из **`.env`** хоста.

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

Отдельный compose с **только** приложением и **Caddy** для HTTPS (без nginx из репозитория) можно собрать вручную по примеру ниже — в репозитории по умолчанию используется связка **family-tree + nginx**.

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
| Nginx (reverse proxy) | ~5-15 МБ |
| Caddy (если используете отдельно) | 10-15 МБ |
| Docker overhead | 20-30 МБ |
| Итого (compose по умолчанию) | ~130-180 МБ |

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

# 7. Проверка (с nginx по умолчанию — порт 8080; на VPS смените mapping на 80:80 или поставьте Caddy)
docker compose logs -f
curl -s http://127.0.0.1:8080/health
# При TLS через Caddy на 443:
# curl -fsS https://tree.example.com/health
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
| DATABASE_PATH | нет | см. compose | Путь к SQLite в контейнере (**`/data/db/family-tree.db`** в compose) |
| DB_PATH | нет | — | Алиас к **DATABASE_PATH** (см. `.env.example`) |
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
