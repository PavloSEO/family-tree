import { runMigrate } from "./migrate.js";
import { runSeed } from "./seed.js";

runMigrate();
runSeed();
console.log("Migrations and seed completed.");
