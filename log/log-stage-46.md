# Этап 46 — клиент: инфографика и блоки карточки

**ROADMAP:** **`InfoGraphics`** (возраст, зодиаки, кровь, места), **`ContactsBlock`** (`tel:` / `mailto:` / иконки соцсетей), **`CustomFieldsBlock`**.

## Сделано

### Компоненты (`packages/client/src/components/person`)

- **`InfoGraphics.tsx`** — **`hasInfoGraphicsContent`**, **`InfoGraphics`**: возраст (**`computeAgeYears`**, склонение по-русски), западный и китайский зодиак (**`westernZodiacFromIso`**, **`chineseZodiacAnimalFromIso`**), группа крови, место рождения и текущее место — только непустые строки.
- **`ContactsBlock.tsx`** — **`hasContactsContent`**, **`ContactsBlock`**: **`tel:`** (очистка пробелов/скобок), **`mailto:`**, соцсети — круглые кнопки с **`md-icon`** + **`material-symbols-outlined`**, эвристика иконки по URL/платформе.
- **`CustomFieldsBlock.tsx`** — **`hasCustomFieldsContent`**, сетка ключ → значение, сортировка ключей по **`ru`**.

### `PersonPage`

- Секция **«Инфографика»** сразу под шапкой карточки (при наличии данных).
- **«О человеке»** — без дублирования места рождения (оно в инфографике).
- **«Контакты»** и **«Дополнительные поля»** — через новые компоненты.
- **«Дополнительно»** — страна и имена на других языках (без крови, текущего места и **`customFields`** — они вынесены).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**47** — сервер: backup service, маршруты **`POST/GET/DELETE /api/backup`**, скачивание — `ROADMAP.md`, `log-stage-47.md`.
