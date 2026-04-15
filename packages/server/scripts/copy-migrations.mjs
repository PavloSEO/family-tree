import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const from = path.join(here, "../src/db/migrations");
const to = path.join(here, "../dist/migrations");
fs.mkdirSync(to, { recursive: true });
fs.cpSync(from, to, { recursive: true });
