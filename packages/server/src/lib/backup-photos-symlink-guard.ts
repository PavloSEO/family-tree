import fs from "node:fs";
import path from "node:path";

function isResolvedPathInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  if (rel === "") {
    return true;
  }
  return !rel.startsWith("..") && !path.isAbsolute(rel);
}

/**
 * Ищет симлинк под `root`, чей `realpath` выходит за пределы `root` (после realpath корня).
 * @returns абсолютный путь к проблемному симлинку или `null`
 */
export function findSymlinkPointingOutsidePhotosRoot(root: string): string | null {
  if (!fs.existsSync(root)) {
    return null;
  }
  let rootReal: string;
  try {
    rootReal = fs.realpathSync.native(path.resolve(root));
  } catch {
    return null;
  }
  const stack: string[] = [rootReal];
  const visitedDirs = new Set<string>();

  while (stack.length > 0) {
    const dir = stack.pop()!;
    if (visitedDirs.has(dir)) {
      continue;
    }
    visitedDirs.add(dir);

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      let lst: fs.Stats;
      try {
        lst = fs.lstatSync(full);
      } catch {
        continue;
      }
      if (!lst.isSymbolicLink()) {
        if (lst.isDirectory()) {
          stack.push(full);
        }
        continue;
      }

      let targetReal: string;
      try {
        targetReal = fs.realpathSync.native(full);
      } catch {
        return full;
      }

      if (!isResolvedPathInside(rootReal, targetReal)) {
        return full;
      }

      try {
        if (fs.statSync(full).isDirectory()) {
          stack.push(targetReal);
        }
      } catch {
        /* ignore */
      }
    }
  }

  return null;
}
