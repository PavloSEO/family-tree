import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth.js";
import {
  shellAdminNavForRole,
  shellMainNavForRole,
  type ShellNavEntry,
} from "./shell-nav.js";
import { UiLangSwitch } from "./UiLangSwitch.js";

function NavItem({ item }: { item: ShellNavEntry }) {
  const { t } = useTranslation("layout");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = item.match(pathname);

  return (
    <md-list-item
      type="button"
      headline={t(item.labelKey)}
      aria-selected={active}
      className={active ? "app-shell__nav-item--active" : undefined}
      onClick={() => {
        navigate(item.to);
      }}
    >
      <md-icon slot="start" className="material-symbols-outlined">
        {item.icon}
      </md-icon>
    </md-list-item>
  );
}

export function AppShell() {
  const { t } = useTranslation("layout");
  const { logout, user } = useAuth();
  if (!user) {
    return null;
  }
  const mainNav = shellMainNavForRole(user.role);
  const adminNav = shellAdminNavForRole(user.role);

  return (
    <div className="app-shell flex min-h-screen">
      <aside className="app-shell__sidebar flex w-[280px] shrink-0 flex-col">
        <div className="app-shell__brand px-4 py-5">
          <p className="app-shell__brand-title md-typescale-title-large m-0">
            {t("brandTitle")}
          </p>
          <p className="app-shell__brand-sub md-typescale-body-small m-0 mt-1">
            {t("navCaption")}
          </p>
          <UiLangSwitch className="mt-3" />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
          <md-list className="app-shell__list">
            {mainNav.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </md-list>

          {adminNav.length > 0 ? (
            <>
              <md-divider className="my-2" />

              <p className="app-shell__admin-heading md-typescale-label-large mx-3 my-2">
                {t("sectionAdmin")}
              </p>
              <md-list className="app-shell__list">
                {adminNav.map((item) => (
                  <NavItem key={item.to} item={item} />
                ))}
              </md-list>
            </>
          ) : null}
        </nav>

        <div className="app-shell__footer mt-auto px-3 py-3">
          <md-text-button
            onClick={() => {
              logout();
            }}
          >
            <md-icon slot="icon" className="material-symbols-outlined">
              logout
            </md-icon>
            {t("logout")}
          </md-text-button>
        </div>
      </aside>

      <main className="app-shell__main min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
