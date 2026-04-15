import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchPersonsList } from "../api/persons.js";
import { useAuth } from "../hooks/useAuth.js";

export function HomePage() {
  const { user } = useAuth();
  const [emptyDb, setEmptyDb] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      setEmptyDb(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchPersonsList({ page: 1, limit: 1 });
        if (!cancelled) {
          setEmptyDb(res.total === 0);
        }
      } catch {
        if (!cancelled) {
          setEmptyDb(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  if (user?.role === "admin" && emptyDb === null) {
    return (
      <div className="p-6">
        <p
          className="md-typescale-body-large m-0"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          Загрузка…
        </p>
      </div>
    );
  }

  if (user?.role === "admin" && emptyDb === true) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="p-6">
      <h1 className="md-typescale-display-small m-0">Главная</h1>
      <p className="md-typescale-body-large mt-4 max-w-prose">
        Вы вошли как <strong>{user?.login}</strong> ({user?.role}).
      </p>
      <p
        className="md-typescale-body-medium mt-2 max-w-prose"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        Выберите раздел в боковой панели. Выход — внизу слева.
      </p>
    </div>
  );
}
