# Участие в проекте

1. Форкните репозиторий и создайте ветку от `main`.
2. Установите зависимости: `corepack enable` и `pnpm install` в корне монорепозитория.
3. Перед коммитом выполните **`pnpm run typecheck`** и при необходимости **`pnpm run build`**.
4. Опишите изменения в сообщении коммита и в описании pull request.

Не добавляйте в git каталог **`log/`**, **`log.zip`**, **`material-web-main/`**, корневой **`nginx.zip`** (локальные артефакты и чужие примеры конфигов). Они перечислены в **`.gitignore`**. Рабочий конфиг nginx для Docker — **`docker/nginx/`**.

Вопросы и баги — через [Issues](https://github.com/PavloSEO/family-tree/issues).
