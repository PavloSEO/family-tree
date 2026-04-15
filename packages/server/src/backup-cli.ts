import "./bootstrap.js";
import { createBackup } from "./services/backup.service.js";

void createBackup()
  .then((b) => {
    console.log(
      JSON.stringify({
        ok: true,
        filename: b.filename,
        sizeBytes: b.sizeBytes,
        createdAt: b.createdAt,
      }),
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
