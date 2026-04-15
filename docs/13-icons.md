# 13 — Icon system

---

## Primary icons: Material Symbols

Loaded via Google Fonts CDN in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

Usage in Material Web:
```html
<md-icon>person</md-icon>
```

Usage in custom components:
```html
<span class="material-symbols-outlined">person</span>
```

## Catalog of icons in use

### Navigation

| Purpose | Material Symbol |
|-----------|----------------|
| Tree | `account_tree` |
| Cards | `person` |
| Links | `link` |
| Photo albums | `photo_library` |
| Users | `group` |
| Settings | `settings` |
| Backups | `backup` |

### Actions

| Purpose | Material Symbol |
|-----------|----------------|
| Create | `add` |
| Edit | `edit` |
| Delete | `delete` |
| Save | `save` |
| Cancel | `close` |
| Search | `search` |
| Filter | `filter_list` |
| Sort ascending | `arrow_upward` |
| Sort descending | `arrow_downward` |
| Download | `download` |
| Upload file | `upload` |
| Refresh | `refresh` |
| Reset | `restart_alt` |
| Expand | `unfold_more` |
| Collapse | `unfold_less` |
| Back | `arrow_back` |
| Forward | `arrow_forward` |
| Previous | `chevron_left` |
| Next | `chevron_right` |
| Sign out | `logout` |
| Sign in | `login` |

### Status and data

| Purpose | Material Symbol |
|-----------|----------------|
| Male | `male` |
| Female | `female` |
| Living | `favorite` |
| Deceased | `church` (or no icon, monochrome style) |
| Warning | `warning` |
| Error | `error` |
| Success | `check_circle` |
| Info | `info` |
| Empty photo | `no_photography` |
| Broken photo | `broken_image` |
| No data | `person_off` |

### Contacts

| Purpose | Material Symbol |
|-----------|----------------|
| Phone | `phone` |
| Email | `mail` |
| Website | `language` |
| Place | `location_on` |
| Date | `calendar_today` |

### Card

| Purpose | Material Symbol |
|-----------|----------------|
| Relatives | `family_restroom` |
| Infographics | `analytics` |
| Biography | `description` |
| Work | `work` |
| Hobbies | `interests` |
| Extra fields | `more_horiz` |
| Photo | `photo_camera` |
| Albums | `collections` |

## Fallback: Lucide React

For icons missing from Material Symbols (social networks, specifics):

```tsx
import { Send, Facebook, Instagram, Linkedin, MessageCircle, Music2 } from 'lucide-react';
```

| Platform | Lucide component |
|-----------|-----------------|
| Telegram | `Send` |
| Facebook | `Facebook` |
| Instagram | `Instagram` |
| LinkedIn | `Linkedin` |
| WhatsApp | `MessageCircle` |
| TikTok | `Music2` |
| VK | Custom SVG (not in Lucide) |

### Styling Lucide for M3

```tsx
<Send
  size={20}
  strokeWidth={2}
  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
/>
```

## No emoji in UI

Emoji are used ONLY for country flags (derived from ISO codes programmatically). All other icons are Material Symbols or Lucide.
