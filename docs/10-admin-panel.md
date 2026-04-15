# 10 — Admin panel

---

## Navigation

Admin sees the full sidebar:

| Item | Icon (Material Symbol) | Path |
|-------|--------------------------|------|
| Tree | `account_tree` | /tree |
| Cards | `person` | /admin/persons |
| Links | `link` | /admin/relationships |
| Photo albums | `photo_library` | /admin/albums |
| Users | `group` | /admin/users |
| Settings | `settings` | /admin/settings |
| Backups | `backup` | /admin/backup |

Viewer sees:

| Item | Icon | Path |
|-------|--------|------|
| Tree | `account_tree` | /tree |
| Photo albums | `photo_library` | /albums |

Viewer does **not** see admin sections. Edit controls are absent from the DOM (not merely disabled).

---

## Cards (AdminPersonsPage)

### Table

Component: `DataTable` (custom, TanStack Table + M3 styles).

Columns:

| Column | Width | Content |
|---------|--------|-----------|
| Photo | 48px | Round thumbnail or placeholder |
| Name | auto | firstName + lastName |
| Sex | 80px | Material Symbol `male` / `female` |
| Birth date | 120px | Formatted date or “--” |
| Country | 80px | Emoji flag or “--” |
| Status | 80px | “living” / year of death |
| Actions | 96px | `md-icon-button` edit + delete |

Above the table:
- `md-outlined-text-field` with `search` icon — name search
- `md-outlined-select` — country filter
- `md-outlined-select` — status filter (all / living / deceased)

FAB (bottom-right, fixed): `md-fab` with `add` — “Create card”.

Empty state: Material Symbol `person_off` (large) + “No cards yet. Create the first one.”

### Form (AdminPersonEditPage)

URL: `/admin/persons/new` (create) or `/admin/persons/:id/edit` (edit).

React Hook Form + Zod. One form for both modes.

Structure:

```
[Title: "Create card" / "Edit: John Smith"]

=== MAIN (always visible) ===
[md-outlined-text-field: First name *]
[md-outlined-text-field: Last name *]
[md-radio: Male]  [md-radio: Female]   <- Sex *

=== v Extra name (accordion, collapsed) ===
[md-outlined-text-field: Patronymic]
[md-outlined-text-field: Maiden name]
+ Localized names:
  [md-outlined-text-field: Language (en)]  [First]  [Last]
  [md-text-button: + Add language]

=== v Dates and places (accordion) ===
[md-outlined-text-field type=date: Birth date]
[md-outlined-text-field type=date: Death date]
[md-outlined-text-field: Birth place]
[md-outlined-text-field: Current location]
[md-outlined-select: Country (ISO list)]

=== v Photo (accordion) ===
[FileDropzone: Drop photo or click to choose]
[Preview of current photo if any]
[md-text-button: Remove photo]

=== v Contacts (accordion) ===
[md-outlined-text-field: Phone]
[md-outlined-text-field: Email]
Social:
  [md-outlined-select: Platform]  [md-outlined-text-field: URL]  [md-icon-button: delete]
  [md-text-button: + Add social link]

=== v About (accordion) ===
[md-outlined-text-field type=textarea rows=4: Bio]
[md-outlined-text-field: Occupation]
Hobbies:
  [md-chip-set: md-input-chip per hobby, removable]
  [md-outlined-text-field: New hobby]  [md-icon-button: add]

=== v Medical (accordion) ===
[md-outlined-select: Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)]

=== v Custom fields (accordion) ===
[md-outlined-text-field: Key]  [md-outlined-text-field: Value]  [md-icon-button: delete]
[md-text-button: + Add field]

=== Actions ===
[md-filled-button: Save]  [md-outlined-button: Cancel]
```

After create on save: `md-dialog` “Add relationships?” with “Yes” (go to RelationshipForm) / “Later”.

---

## Links (AdminRelationshipsPage)

### Table

Columns:

| Column | Content |
|---------|-----------|
| Type | “Parent” / “Spouse” |
| Person A | Name + mini avatar |
| Person B | Name + mini avatar |
| Wedding date | For spouse, else “--” |
| Status | “Current marriage” / “Former” / “--” |
| Actions | edit (spouse meta) + delete |

FAB: `md-fab` + `add` — “Create link”.

### Visual helper (RelationshipForm)

```
=== Step 1: First person ===
[md-outlined-text-field: Search by name...]
  -> md-menu with results
  -> Selected: [avatar] John Smith

=== Step 2: Link type ===
[md-radio name=type: Parent -> Child]
[md-radio name=type: Spouses]

=== Step 3: Second person ===
[md-outlined-text-field: Search by name...]
  -> Selected: [avatar] Jane Smith

=== For parent ===
Who is the parent?
[md-radio: John]  [md-radio: Jane]

=== For spouse ===
[md-outlined-text-field type=date: Wedding date]
[md-outlined-text-field type=date: Divorce date]
[md-checkbox: Current marriage]
[md-outlined-text-field: Comment]

=== Warnings (if any) ===
md-icon warning + "Jane already has a father listed"

[md-filled-button: Create link]  [md-outlined-button: Cancel]
```

---

## Users (AdminUsersPage)

### Table

Columns: Login, Role, Status, Linked card, Created, Last login, Actions.

### Create (md-dialog)

```
[md-outlined-text-field: Login *]
[md-outlined-text-field type=password: Password *]
[md-outlined-select: Link to card (optional)]
-> Role: always viewer (only one admin)
[md-filled-button: Create]
```

### Actions

- Change password (md-dialog with new password field)
- Deactivate / Activate (`md-switch` in table row)
- Delete (md-dialog confirmation)

---

## Settings (AdminSettingsPage)

```
[md-outlined-text-field: Service name]
[md-outlined-text-field + autocomplete: Default root person]

=== Tree ===
[md-slider labeled: Depth up (1-10, default 3)]
[md-slider labeled: Depth down (1-10, default 3)]
[md-switch: Show external branches by default]
[md-slider labeled: External branch depth (1-5, default 2)]

=== Security ===
[md-slider labeled: Session lifetime, days (1-90, default 30)]

=== Appearance ===
[Color picker: Accent color (default #3B82F6)]

[md-filled-button: Save]
```

---

## Backups (AdminBackupPage)

```
[md-fab: Create backup]  <- On click: md-linear-progress, then toast "Backup created"

Table:
| File | Size | Created | Actions |
| backup-2026-04-13_03-00-00.tar.gz | 45 MB | 2026-04-13 03:00 | [download] [delete] |
```

Automatic backup: cron in Docker, daily at 03:00, keep 30 files.
