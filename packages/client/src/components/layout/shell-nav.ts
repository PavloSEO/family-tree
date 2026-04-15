import type { User } from "@family-tree/shared";

/** Пути как в `docs/01-architecture.md`; видимость пунктов — `shellMainNavForRole` / `shellAdminNavForRole`. */

export type ShellNavEntry = {
  to: string;
  /** Ключ в namespace `layout` (например `nav.tree`). */
  labelKey: string;
  icon: string;
  match: (pathname: string) => boolean;
};

function isPathUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

const NAV_TREE: ShellNavEntry = {
  to: "/tree",
  labelKey: "nav.tree",
  icon: "account_tree",
  match: (p) => isPathUnder(p, "/tree"),
};

const NAV_ALBUMS: ShellNavEntry = {
  to: "/albums",
  labelKey: "nav.albums",
  icon: "photo_library",
  match: (p) =>
    isPathUnder(p, "/albums") ||
    (p.startsWith("/album/") && p !== "/albums"),
};

const NAV_HOME: ShellNavEntry = {
  to: "/",
  labelKey: "nav.home",
  icon: "home",
  match: (p) => p === "/",
};

const NAV_WELCOME: ShellNavEntry = {
  to: "/welcome",
  labelKey: "nav.welcome",
  icon: "waving_hand",
  match: (p) => isPathUnder(p, "/welcome"),
};

/** Viewer: только Дерево и Фотоальбомы (`ROADMAP` этап 14). */
export const SHELL_NAV_VIEWER_MAIN: ShellNavEntry[] = [NAV_TREE, NAV_ALBUMS];

export const SHELL_NAV_ADMIN_MAIN: ShellNavEntry[] = [
  NAV_HOME,
  NAV_TREE,
  NAV_ALBUMS,
  NAV_WELCOME,
];

export const SHELL_NAV_ADMIN: ShellNavEntry[] = [
  {
    to: "/admin/persons",
    labelKey: "nav.adminPersons",
    icon: "badge",
    match: (p) => isPathUnder(p, "/admin/persons"),
  },
  {
    to: "/admin/relationships",
    labelKey: "nav.adminRelationships",
    icon: "family_restroom",
    match: (p) => isPathUnder(p, "/admin/relationships"),
  },
  {
    to: "/admin/users",
    labelKey: "nav.adminUsers",
    icon: "group",
    match: (p) => isPathUnder(p, "/admin/users"),
  },
  {
    to: "/admin/albums",
    labelKey: "nav.adminAlbums",
    icon: "collections",
    match: (p) => isPathUnder(p, "/admin/albums"),
  },
  {
    to: "/admin/settings",
    labelKey: "nav.adminSettings",
    icon: "settings",
    match: (p) => isPathUnder(p, "/admin/settings"),
  },
  {
    to: "/admin/backup",
    labelKey: "nav.adminBackup",
    icon: "backup",
    match: (p) => isPathUnder(p, "/admin/backup"),
  },
];

export function shellMainNavForRole(role: User["role"]): ShellNavEntry[] {
  return role === "viewer" ? SHELL_NAV_VIEWER_MAIN : SHELL_NAV_ADMIN_MAIN;
}

export function shellAdminNavForRole(role: User["role"]): ShellNavEntry[] {
  return role === "admin" ? SHELL_NAV_ADMIN : [];
}
