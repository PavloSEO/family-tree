import { StrictMode, Suspense } from "react";
import "./i18n.js";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { App } from "./App.js";
import { AppLoadingFallback } from "./components/layout/AppLoadingFallback.js";
import "./material-imports.js";
import { AuthProvider } from "./providers/AuthProvider.js";
import "./styles/global.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root");
}
/** Narrowing for async `mount` (TS does not carry `root` refinement into deferred callbacks). */
const appRoot: HTMLElement = rootEl;

const app = (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <>
          {/* react-i18next v14+: I18nextProvider не нужен. Suspense — на случай lazy-ресурсов / Trans; при статическом JSON чаще не срабатывает. */}
          <Suspense fallback={<AppLoadingFallback />}>
            <App />
          </Suspense>
          <Toaster
            position="bottom-center"
            theme="light"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "sonner-toast",
                title: "sonner-toast__title",
                description: "sonner-toast__description",
                closeButton: "sonner-toast__close",
              },
            }}
          />
        </>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

function mount() {
  createRoot(appRoot).render(app);
}

void document.fonts.ready.then(mount).catch(mount);
