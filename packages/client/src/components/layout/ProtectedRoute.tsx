import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { AppLoadingFallback } from "./AppLoadingFallback.js";

/**
 * Доступ только при наличии сессии (`user`).
 * Иначе редирект на `/login` с сохранением исходного пути (`docs/07-auth.md`).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <AppLoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
