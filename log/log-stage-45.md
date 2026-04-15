# Этап 45 — shared: утилиты инфографики

**ROADMAP:** **`zodiac.ts`**, **`chinese-year.ts`**, **`age.ts`**, **`date-format.ts`** — вычисления для блока карточки (этап 46).

## Сделано

### Модули (`packages/shared/src`)

- **`date-format.ts`** — **`parseIsoDateParts`** (валидация календаря, в т.ч. 29.02), **`formatDateRu`** (`DD.MM.YYYY`), **`formatDateLongRu`** (`Intl`, `ru-RU`).
- **`zodiac.ts`** — тропический зодиак по дате: **`westernZodiacFromIso`**, константа **`WESTERN_ZODIAC_SIGNS_RU`**.
- **`chinese-year.ts`** — упрощённый цикл по **григорианскому году** `(year - 4) mod 12`: **`chineseZodiacAnimalFromYear`**, **`chineseZodiacAnimalFromIso`**, **`CHINESE_ZODIAC_ANIMALS_RU`**.
- **`age.ts`** — **`computeAgeYears`**: полные года на **`asOf`** или на дату смерти (**`deathIso`**).

### Экспорт

- **`packages/shared/src/index.ts`** — реэкспорт перечисленных модулей.

### Тесты (Vitest)

- **`date-format.test.ts`**, **`zodiac.test.ts`**, **`chinese-year.test.ts`**, **`age.test.ts`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/shared run test
```

## Следующий этап

**46** — клиент: **`InfoGraphics`**, **`ContactsBlock`**, **`CustomFieldsBlock`** в карточке персоны — `ROADMAP.md`, `log-stage-46.md`.
