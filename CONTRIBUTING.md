# Contributing

1. Fork the repository and create a branch from `main`.
2. Install dependencies: `corepack enable` and `pnpm install` at the monorepo root.
3. Before committing, run **`pnpm run typecheck`** and, if needed, **`pnpm run build`**.
4. Describe changes in the commit message and in the pull request description.

Do not commit the **`log/`** directory, **`log.zip`**, **`material-web-main/`**, or secrets such as **`docker/nginx/certs/*.pem`**. See **`.gitignore`**. The working nginx config lives under **`docker/nginx/`**.

Questions and bugs — via [Issues](https://github.com/PavloSEO/family-tree/issues).
