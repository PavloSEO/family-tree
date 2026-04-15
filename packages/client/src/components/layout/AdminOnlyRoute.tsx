import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { MdButton } from "../md/index.js";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * Только для `user.role === "admin"`. Без входа — на `/`; иначе без прав — сообщение и ссылка.
 */
export function AdminOnlyRoute() {
  const { user } = useAuth();
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="md-typescale-body-large m-0 max-w-md text-[var(--md-sys-color-on-surface-variant)]">
          {t("route.noAccess")}
        </p>
        <MdButton
          variant="filled"
          type="button"
          onClick={() => {
            navigate("/");
          }}
        >
          {t("route.goHome")}
        </MdButton>
      </div>
    );
  }

  return <Outlet />;
}
