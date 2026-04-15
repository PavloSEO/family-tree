# 13 -- Система иконок

---

## Основные иконки: Material Symbols

Подключение через Google Fonts CDN в `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

Использование в Material Web:
```html
<md-icon>person</md-icon>
```

Использование в кастомных компонентах:
```html
<span class="material-symbols-outlined">person</span>
```

## Каталог используемых иконок

### Навигация

| Назначение | Material Symbol |
|-----------|----------------|
| Дерево | `account_tree` |
| Карточки | `person` |
| Связи | `link` |
| Фотоальбомы | `photo_library` |
| Пользователи | `group` |
| Настройки | `settings` |
| Бэкапы | `backup` |

### Действия

| Назначение | Material Symbol |
|-----------|----------------|
| Создать | `add` |
| Редактировать | `edit` |
| Удалить | `delete` |
| Сохранить | `save` |
| Отмена | `close` |
| Поиск | `search` |
| Фильтр | `filter_list` |
| Сортировка вверх | `arrow_upward` |
| Сортировка вниз | `arrow_downward` |
| Скачать | `download` |
| Загрузить файл | `upload` |
| Обновить | `refresh` |
| Сбросить | `restart_alt` |
| Развернуть | `unfold_more` |
| Свернуть | `unfold_less` |
| Назад | `arrow_back` |
| Вперед | `arrow_forward` |
| Предыдущий | `chevron_left` |
| Следующий | `chevron_right` |
| Выйти | `logout` |
| Войти | `login` |

### Статусы и данные

| Назначение | Material Symbol |
|-----------|----------------|
| Мужской пол | `male` |
| Женский пол | `female` |
| Живой | `favorite` |
| Умерший | `church` (или без иконки, ч/б стиль) |
| Предупреждение | `warning` |
| Ошибка | `error` |
| Успех | `check_circle` |
| Инфо | `info` |
| Пустая фото | `no_photography` |
| Битая фото | `broken_image` |
| Нет данных | `person_off` |

### Контакты

| Назначение | Material Symbol |
|-----------|----------------|
| Телефон | `phone` |
| Email | `mail` |
| Сайт | `language` |
| Место | `location_on` |
| Дата | `calendar_today` |

### Карточка

| Назначение | Material Symbol |
|-----------|----------------|
| Родственники | `family_restroom` |
| Инфографика | `analytics` |
| Биография | `description` |
| Работа | `work` |
| Хобби | `interests` |
| Доп. поля | `more_horiz` |
| Фото | `photo_camera` |
| Альбомы | `collections` |

## Fallback: Lucide React

Для иконок, которых нет в Material Symbols (соцсети, специфичные):

```tsx
import { Send, Facebook, Instagram, Linkedin, MessageCircle, Music2 } from 'lucide-react';
```

| Платформа | Lucide компонент |
|-----------|-----------------|
| Telegram | `Send` |
| Facebook | `Facebook` |
| Instagram | `Instagram` |
| LinkedIn | `Linkedin` |
| WhatsApp | `MessageCircle` |
| TikTok | `Music2` |
| VK | Кастомная SVG (нет в Lucide) |

### Стилизация Lucide под M3

```tsx
<Send
  size={20}
  strokeWidth={2}
  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
/>
```

## Никаких emoji в UI

Emoji используются ТОЛЬКО для флагов стран (программно из ISO-кода). Все остальные иконки -- Material Symbols или Lucide.
