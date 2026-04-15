import "./bootstrap.js";
import { Hono } from "hono";
import type { AuthUser } from "./middleware/auth.js";
import { apiMutateRateLimit } from "./middleware/api-mutate-rate-limit.js";
import { securityHeaders } from "./middleware/security-headers.js";
import { albumRoutes } from "./routes/albums.js";
import { backupRoutes } from "./routes/backup.js";
import { authRoutes } from "./routes/auth.js";
import { photosRoutes } from "./routes/photos.js";
import { personRoutes } from "./routes/persons.js";
import { relationshipRoutes } from "./routes/relationships.js";
import { settingsRoutes } from "./routes/settings.js";
import { treeRoutes } from "./routes/tree.js";
import { userRoutes } from "./routes/users.js";
import { registerClientSpaIfProd } from "./static-spa.js";

/** Глобальный тип контекста: `c.get("user")` после `requireAuth`. */
export const app = new Hono<{ Variables: { user: AuthUser } }>();

app.use("*", securityHeaders);
app.use("/api/*", apiMutateRateLimit);

app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/api/auth", authRoutes);
app.route("/api/backup", backupRoutes);
app.route("/api/albums", albumRoutes);
app.route("/api/photos", photosRoutes);
app.route("/api/persons", personRoutes);
app.route("/api/relationships", relationshipRoutes);
app.route("/api/tree", treeRoutes);
app.route("/api/users", userRoutes);
app.route("/api/settings", settingsRoutes);

registerClientSpaIfProd(app);
