import { Navigate, Route, Routes } from "react-router-dom";
import { AdminOnlyRoute } from "./components/layout/AdminOnlyRoute.js";
import { AppLoadingFallback } from "./components/layout/AppLoadingFallback.js";
import { AppShell } from "./components/layout/AppShell.js";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.js";
import { useAuth } from "./hooks/useAuth.js";
import { AdminPersonEditPage } from "./pages/AdminPersonEditPage.js";
import { AdminPersonsPage } from "./pages/AdminPersonsPage.js";
import { AdminRelationshipNewPage } from "./pages/AdminRelationshipNewPage.js";
import { AdminBackupPage } from "./pages/AdminBackupPage.js";
import { AdminAlbumsPage } from "./pages/AdminAlbumsPage.js";
import { AdminRelationshipsPage } from "./pages/AdminRelationshipsPage.js";
import { AdminSettingsPage } from "./pages/AdminSettingsPage.js";
import { AdminUsersPage } from "./pages/AdminUsersPage.js";
import { AlbumPage } from "./pages/AlbumPage.js";
import { AlbumPhotoTagPage } from "./pages/AlbumPhotoTagPage.js";
import { AlbumsBrowsePage } from "./pages/AlbumsBrowsePage.js";
import { DisabledPage } from "./pages/DisabledPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RootAuthLanding } from "./pages/RootAuthLanding.js";
import { PersonPage } from "./pages/PersonPage.js";
import { WelcomePage } from "./pages/WelcomePage.js";
import { TreeLandingPage } from "./pages/TreeLandingPage.js";
import { TreePage } from "./pages/TreePage.js";

export function App() {
  const { ready } = useAuth();

  if (!ready) {
    return <AppLoadingFallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/disabled" element={<DisabledPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootAuthLanding />} />
        <Route path="tree" element={<TreeLandingPage />} />
        <Route path="tree/:personId" element={<TreePage />} />
        <Route path="person/:id" element={<PersonPage />} />
        <Route path="albums" element={<AlbumsBrowsePage />} />
        <Route
          path="album/:albumId/photo/:photoId"
          element={<AlbumPhotoTagPage />}
        />
        <Route path="album/:id" element={<AlbumPage />} />
        <Route path="welcome" element={<WelcomePage />} />

        <Route element={<AdminOnlyRoute />}>
          <Route path="admin/persons" element={<AdminPersonsPage />} />
          <Route path="admin/persons/new" element={<AdminPersonEditPage />} />
          <Route path="admin/persons/:id/edit" element={<AdminPersonEditPage />} />
          <Route
            path="admin/relationships/new"
            element={<AdminRelationshipNewPage />}
          />
          <Route path="admin/relationships" element={<AdminRelationshipsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/albums" element={<AdminAlbumsPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
          <Route path="admin/backup" element={<AdminBackupPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
