/**
 * Family Tree UI Kit — Shared Utilities
 * Exposes: Icon, Sidebar, NavItem, Avatar, Chip, Btn, IconBtn, Fab,
 *          SectionCard, TextField, EmptyState, Toast
 * Load BEFORE the page scripts.
 */

// ─── Inline SVG Icons (font-independent) ────────────────────────────────────
const ICON_PATHS = {
  account_tree:    'M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-12h3v4h-3V3z',
  person:          'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  photo_library:   'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z',
  home:            'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  waving_hand:     'M23 11.5c0-.83-.67-1.5-1.5-1.5-.28 0-.54.08-.75.22L19 8.5c-.28-.48-.87-.65-1.37-.4l-.13.08c-.1-.75-.74-1.33-1.5-1.33-.7 0-1.29.48-1.46 1.13L14 7.5c-.28-.48-.87-.66-1.37-.4-.3.17-.5.46-.56.79l-.07-.14c-.28-.48-.87-.65-1.37-.4-.48.28-.65.87-.4 1.37l.37.63c-.06-.01-.12-.02-.18-.02-.55 0-1.02.45-1.02 1 0 .28.11.53.29.71L8 11c-2.21 0-4 1.79-4 4 0 2.76 2.24 5 5 5h6c2.21 0 4.29-1.12 5.5-3l1.91-3.27c.06-.1.09-.21.09-.32 0-.28-.16-.54-.4-.67l-.1-.05c.19-.3.25-.67.08-1.01L22 11l.09.15c.19.32.59.43.91.24.62-.35.94-1.03.94-1.73 0-.06 0-.11-.01-.16h.01z',
  settings:        'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  backup:          'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z',
  badge:           'M20 7h-5V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7 0h-2V4h2v3zm1 11.5H10v-1c0-1.1.9-2 2-2s2 .9 2 2v1zm4-2h-2.5c-.28-1.46-1.57-2.58-3.12-2.58S9.78 15.04 9.5 16.5H7V9h10v7.5z',
  family_restroom: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9 11.5c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-5C6.51 6.5 4.5 8.51 4.5 11H6v9h6v-4h3v4h6V11h1.5c0-2.49-2.01-4.5-4.5-4.5h-9zM18 11.5c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z',
  group:           'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  collections:     'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z',
  add:             'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  edit:            'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  delete:          'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  search:          'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  filter_list:     'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z',
  logout:          'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  login:           'M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z',
  arrow_back:      'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  chevron_left:    'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  chevron_right:   'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  first_page:      'M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z',
  last_page:       'M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z',
  restart_alt:     'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
  expand_more:     'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
  expand_less:     'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z',
  warning:         'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  contact_mail:    'M21 8V7l-3 2-3-2v1l3 2 3-2zm1-5H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm8-6h-8V6h8v6z',
  work:            'M20 6h-2.18c.07-.44.18-.86.18-1 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 .14.11.56.18 1H8c-1.11 0-1.99.89-1.99 2L6 19c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6-3c1.1 0 2 .9 2 2 0 .14-.11.56-.18 1h-3.64c-.07-.44-.18-.86-.18-1 0-1.1.9-2 2-2zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
  insights:        'M21 6.5l-4-4-4 4-4-4L3 8v2l6-5.5 4 4 4-4 4 4V6.5zM3 16l4 4 4-4 4 4 4-4v-2l-4 4-4-4-4 4-4-4v2zm7-4l-4-4-3 3v2l3-3 4 4 4-4 3 3v-2l-3-3-4 4z',
  phone:           'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  mail:            'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  location_on:     'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  calendar_today:  'M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z',
  description:     'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  no_photography:  'M2.39 1.73 1.11 3l2 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c.33 0 .63-.09.91-.23L21.62 22.9l1.27-1.27L2.39 1.73zM3 19V7h1.13l2.04 2.04C5.43 9.68 5 10.78 5 12c0 3.31 2.69 6 6 6 1.22 0 2.32-.43 3.27-1.17l1.62 1.62c-.21.03-.59.55-.89.55H3zm10.27-1.1C12.58 18.59 11.81 19 11 19c-2.76 0-5-2.24-5-5 0-.81.41-1.58 1.1-2.27l6.17 6.17zM21 5.18V17L8.28 4.28 9 3.5l2.5 2.5H17l2 2h2c1.1 0 2 .9 2 2v12c0 .33-.08.63-.21.91L22 19.12V7.18L21 5.18z',
  'close':         'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  more_horiz:      'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
};

function Icon({ name, size = 20, color, style: extraStyle }) {
  const path = ICON_PATHS[name];
  const col = color || 'currentColor';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={col}
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...extraStyle }}
    >
      {path
        ? <path d={path} />
        : <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.3" />}
    </svg>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ active, role = 'admin', onNav }) {
  const mainNav = [
    { key: 'tree',   icon: 'account_tree', label: 'Tree',   path: '/tree' },
    { key: 'albums', icon: 'photo_library', label: 'Albums', path: '/albums' },
    ...(role === 'admin' ? [
      { key: 'home',    icon: 'home',         label: 'Home',    path: '/' },
      { key: 'welcome', icon: 'waving_hand',  label: 'Welcome', path: '/welcome' },
    ] : []),
  ];
  const adminNav = role === 'admin' ? [
    { key: 'persons',       icon: 'badge',           label: 'Persons',       path: '/admin/persons' },
    { key: 'relationships', icon: 'family_restroom',  label: 'Relationships', path: '/admin/relationships' },
    { key: 'users',         icon: 'group',            label: 'Users',         path: '/admin/users' },
    { key: 'albums-admin',  icon: 'collections',      label: 'Albums',        path: '/admin/albums' },
    { key: 'settings',      icon: 'settings',         label: 'Settings',      path: '/admin/settings' },
    { key: 'backup',        icon: 'backup',           label: 'Backup',        path: '/admin/backup' },
  ] : [];

  return (
    <aside style={{
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'var(--md-sys-color-surface-container-low)',
      borderRight: '1px solid var(--md-sys-color-outline-variant)',
      minHeight: '100vh',
    }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 400, color: 'var(--md-sys-color-on-surface)' }}>Family Tree</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)' }}>Family archive</p>
      </div>
      <nav style={{ padding: 8, flex: 1, overflowY: 'auto' }}>
        {mainNav.map(item => (
          <NavItem key={item.key} item={item} active={active === item.key} onNav={onNav} />
        ))}
        {adminNav.length > 0 && <>
          <div style={{ height: 1, background: 'var(--md-sys-color-outline-variant)', margin: '4px 12px' }} />
          <p style={{ margin: '4px 16px 2px', fontSize: 11, fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Admin</p>
          {adminNav.map(item => (
            <NavItem key={item.key} item={item} active={active === item.key} onNav={onNav} />
          ))}
        </>}
      </nav>
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none',
          color: 'var(--md-sys-color-primary)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
          fontFamily: 'var(--md-ref-typeface-plain)', padding: '8px 12px', borderRadius: 'var(--md-sys-shape-corner-full)',
        }}>
          <Icon name="logout" size={20} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onNav }) {
  return (
    <div
      onClick={() => onNav && onNav(item.key)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 'var(--md-sys-shape-corner-full)',
        cursor: 'pointer', transition: 'background .15s',
        background: active ? 'var(--md-sys-color-secondary-container)' : 'transparent',
        color: active ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
        marginBottom: 2,
      }}
    >
      <Icon name={item.icon} size={20} />
      <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ src, gender = 'neutral', dead = false, size = 48, shape = 'circle' }) {
  const placeholders = {
    male: '../assets/placeholder-male.svg',
    'male-dead': '../assets/placeholder-male-dead.svg',
    female: '../assets/placeholder-female.svg',
    'female-dead': '../assets/placeholder-female-dead.svg',
    neutral: '../assets/placeholder-neutral-dead.svg',
    'neutral-dead': '../assets/placeholder-neutral-dead.svg',
  };
  const key = dead ? `${gender}-dead` : gender;
  const imgSrc = src || placeholders[key] || placeholders['neutral'];
  const radius = shape === 'circle' ? '50%' : 'var(--md-sys-shape-corner-medium)';
  return (
    <img
      src={imgSrc}
      alt=""
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block', flexShrink: 0 }}
    />
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────
function Chip({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'var(--md-sys-color-secondary-container)',
      color: 'var(--md-sys-color-on-secondary-container)',
      borderRadius: 'var(--md-sys-shape-corner-full)',
      padding: '4px 12px', fontSize: 13, fontWeight: 500,
    }}>{label}</span>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────
function Btn({ children, variant = 'filled', icon, onClick, disabled }) {
  const variants = {
    filled:   { bg: 'var(--md-sys-color-primary)',             color: 'var(--md-sys-color-on-primary)',             border: 'none' },
    outlined: { bg: 'transparent',                             color: 'var(--md-sys-color-primary)',                border: '1px solid var(--md-sys-color-outline)' },
    text:     { bg: 'transparent',                             color: 'var(--md-sys-color-primary)',                border: 'none' },
    tonal:    { bg: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', border: 'none' },
    error:    { bg: 'var(--md-sys-color-error)',               color: 'var(--md-sys-color-on-error)',               border: 'none' },
  };
  const v = variants[variant] || variants.filled;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: v.bg, color: v.color, border: v.border,
        borderRadius: 'var(--md-sys-shape-corner-full)',
        padding: variant === 'text' ? '10px 12px' : '10px 24px',
        fontFamily: 'var(--md-ref-typeface-plain)', fontSize: 14, fontWeight: 500,
        letterSpacing: '0.1px', cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.38 : 1, lineHeight: '20px',
      }}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

function IconBtn({ icon, onClick, title, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 40, height: 40, border: 'none', background: 'transparent',
        borderRadius: 'var(--md-sys-shape-corner-full)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        color: color || 'var(--md-sys-color-on-surface-variant)',
      }}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

function Fab({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: label ? 12 : 0,
        justifyContent: 'center',
        background: 'var(--md-sys-color-primary-container)',
        color: 'var(--md-sys-color-on-primary-container)',
        border: 'none',
        borderRadius: label ? 'var(--md-sys-shape-corner-large)' : 'var(--md-sys-shape-corner-large)',
        width: label ? 'auto' : 56, height: 56,
        padding: label ? '0 20px' : 0,
        boxShadow: '0 4px 8px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.14)',
        cursor: 'pointer', fontFamily: 'var(--md-ref-typeface-plain)',
        fontSize: 14, fontWeight: 500,
      }}
    >
      <Icon name={icon} size={24} />
      {label && <span>{label}</span>}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      background: 'var(--md-sys-color-surface-container-low)',
      borderRadius: 'var(--md-sys-shape-corner-medium)',
      boxShadow: '0 1px 2px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.14)',
      padding: 24, marginBottom: 16,
    }}>
      <h2 style={{
        display: 'flex', alignItems: 'center', gap: 8,
        margin: '0 0 12px', fontSize: 22, fontWeight: 400,
        color: 'var(--md-sys-color-on-surface)',
      }}>
        {icon && <Icon name="{icon}" size={22} color="var(--md-sys-color-primary)" />}
        {title}
      </h2>
      <div style={{ height: 1, background: 'var(--md-sys-color-outline-variant)', marginBottom: 16 }} />
      {children}
    </div>
  );
}

// ─── TextField ───────────────────────────────────────────────────────────────
function TextField({ label, value, onChange, type = 'text', error, errorText, leadingIcon, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        position: 'relative', border: `1px solid ${error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-outline)'}`,
        borderRadius: 'var(--md-sys-shape-corner-extra-small)', padding: leadingIcon ? '8px 12px 6px 40px' : '8px 12px 6px',
        background: 'transparent',
      }}>
        <label style={{
          position: 'absolute', top: -9, left: leadingIcon ? 36 : 10,
          background: 'var(--md-sys-color-background)', padding: '0 4px',
          fontSize: 12, color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)', fontWeight: 500,
        }}>{label}</label>
        {leadingIcon && (<Icon name={leadingIcon} size={20} color="var(--md-sys-color-on-surface-variant)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />)}
        <input
          type={type}
          value={value}
          onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            border: 'none', outline: 'none', width: '100%',
            fontFamily: 'var(--md-ref-typeface-plain)', fontSize: 16,
            background: 'transparent', color: 'var(--md-sys-color-on-surface)',
          }}
        />
      </div>
      {error && errorText && (
        <span style={{ fontSize: 12, color: 'var(--md-sys-color-error)', paddingLeft: 12 }}>{errorText}</span>
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12 }}>
      <Icon name="{icon}" size={48} color="var(--md-sys-color-on-surface-variant)" />
      <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{title}</span>
      {description && <span style={{ fontSize: 14, color: 'var(--md-sys-color-on-surface-variant)' }}>{description}</span>}
      {actionLabel && onAction && <Btn icon="add" onClick={onAction}>{actionLabel}</Btn>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', visible }) {
  if (!visible) return null;
  const styles = {
    success: { bg: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)' },
    error:   { bg: 'var(--md-sys-color-error-container)',   color: 'var(--md-sys-color-on-error-container)' },
  };
  const s = styles[type] || styles.success;
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: s.bg, color: s.color,
      borderRadius: 'var(--md-sys-shape-corner-medium)',
      padding: '12px 24px', fontSize: 14, fontWeight: 500,
      boxShadow: '0 4px 8px rgba(0,0,0,.2)', zIndex: 9999,
    }}>{message}</div>
  );
}

Object.assign(window, {
  Sidebar, NavItem, Avatar, Chip, Btn, IconBtn, Fab,
  SectionCard, TextField, EmptyState, Toast,
});
