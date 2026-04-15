# 04 — Component to UI mapping

---

Each UI element maps to a specific MW component or is marked custom.

## Login page

| Element | Component |
|---------|----------|
| Login field | `md-outlined-text-field` label="Login" |
| Password field | `md-outlined-text-field` type="password" label="Password" |
| “Remember me” checkbox | `md-checkbox` + `<label>` |
| “Sign in” button | `md-filled-button` |
| Icon in button | `md-icon` slot="icon" — `login` |
| Error message | `md-outlined-text-field` error + error-text |
| Title | CSS class `md-typescale-headline-medium` |

## Sidebar

| Element | Component |
|---------|----------|
| Container | `md-navigation-drawer` (labs) |
| Menu list | `md-list` |
| Menu item | `md-list-item` type="button" + `md-icon` slot="start" |
| Divider | `md-divider` |
| Active item | CSS: background `--md-sys-color-secondary-container` |
| User name | CSS class `md-typescale-label-medium` |
| “Sign out” button | `md-text-button` |

### Menu item icons

| Item | Material Symbol |
|-------|----------------|
| Tree | `account_tree` |
| Cards | `person` |
| Links | `link` |
| Photo albums | `photo_library` |
| Users | `group` |
| Settings | `settings` |
| Backups | `backup` |

## Tree (TreePage)

| Element | Component |
|---------|----------|
| Graph canvas | `@xyflow/react` ReactFlow |
| Node (person) | Custom React Flow node (see `docs/08-tree-visualization.md`) |
| Edge (parent) | React Flow default edge, solid line |
| Edge (spouse) | Custom React Flow edge, double line |
| Mode panel | `md-outlined-segmented-button-set` (labs) |
| Mode button | `md-outlined-segmented-button` (labs) |
| Country filter | `md-outlined-select` |
| Status filter | `md-outlined-select` |
| Name search | `md-outlined-text-field` with `search` icon |
| Depth slider | `md-slider` labeled |
| “Reset” button | `md-icon-button` — `restart_alt` |
| Mini map | React Flow MiniMap |
| Zoom controls | React Flow Controls |

## Person card (PersonPage)

| Element | Component |
|---------|----------|
| Card container | `md-elevated-card` (labs) |
| Photo (avatar) | `<img>` with CSS `border-radius: 50%` |
| First and last name | CSS `md-typescale-headline-medium` |
| Life dates | CSS `md-typescale-body-medium` |
| Section divider | `md-divider` |
| Section title | CSS `md-typescale-title-medium` |
| Hobby tags | `md-chip-set` + `md-filter-chip` (read-only) |
| Social links | `md-icon-button` with platform icons |
| Relative link | `md-list-item` type="link" with avatar |
| “Edit” button | `md-fab` size="small" — `edit` (admin only) |

### Social icons (Lucide — not in Material Symbols)

| Platform | Lucide icon |
|-----------|-------------|
| telegram | `Send` |
| facebook | `Facebook` |
| instagram | `Instagram` |
| vk | Custom SVG |
| linkedin | `Linkedin` |
| whatsapp | `MessageCircle` |
| tiktok | `Music2` |
| phone | Material Symbol `phone` |
| email | Material Symbol `mail` |
| website | Material Symbol `language` |

## Admin: data tables

| Element | Component |
|---------|----------|
| Table | Custom `DataTable` (TanStack Table + M3 styles, see `docs/16-custom-components.md`) |
| Column header | Custom, CSS `md-typescale-title-small` |
| Cell | Custom, CSS `md-typescale-body-medium` |
| Sort | `md-icon-button` — `arrow_upward` / `arrow_downward` |
| Pagination | Custom block: `md-icon-button` (prev/next) + text |
| Empty state | Custom: `md-icon` (large) + text |
| “Create” button | `md-fab` (primary, fixed bottom-right) — `add` |
| “Edit” button | `md-icon-button` — `edit` |
| “Delete” button | `md-icon-button` — `delete` |
| Search row | `md-outlined-text-field` — `search` |

## Admin: forms

| Element | Component |
|---------|----------|
| Text field | `md-outlined-text-field` |
| Textarea | `md-outlined-text-field` type="textarea" rows="4" |
| Dropdown | `md-outlined-select` + `md-select-option` |
| Radio (gender) | `md-radio` + `<label>` |
| Checkbox | `md-checkbox` |
| Toggle | `md-switch` |
| Slider | `md-slider` |
| Tags (hobbies) | `md-chip-set` + `md-input-chip` (removable) |
| “Save” button | `md-filled-button` |
| “Cancel” button | `md-outlined-button` |
| Section accordion | Custom (see `docs/16-custom-components.md`) |
| File upload | Custom `FileDropzone` (see `docs/16-custom-components.md`) |
| Upload progress | `md-linear-progress` |

## Dialogs

| Element | Component |
|---------|----------|
| Delete confirmation | `md-dialog` with slot="headline", slot="content", slot="actions" |
| Create user | `md-dialog` with form inside |
| Validation warning | `md-dialog` |

## Notifications (Toast)

| Element | Component |
|---------|----------|
| Success | sonner (M3-styled: `--md-sys-color-primary-container`) |
| Error | sonner (styled: `--md-sys-color-error-container`) |

## Photo gallery

| Element | Component |
|---------|----------|
| Album grid | CSS Grid + `md-elevated-card` (labs) |
| Lightbox | yet-another-react-lightbox |
| People overlay | Canvas overlay (custom) |
| Close icon | `md-icon-button` — `close` |
| Navigation | `md-icon-button` — `chevron_left` / `chevron_right` |
