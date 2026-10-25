// Mindloom inspection CLI. Node 22.12+ with --experimental-strip-types; no build/server/DOM.
import { readFileSync, statSync } from "node:fs";
import { inspectMmap } from "../src/formats/mmap/inspector.ts";
import { normalizeMmap } from "../src/formats/mmap/normalize.ts";
import { MAX_PACKAGE_BYTES } from "../src/formats/mmap/zip-directory.ts";

const [command, ...args] = process.argv.slice(2);
if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
  process.stdout.write(
    "Usage: pnpm mmap-inspect <file.mmap> | pnpm mmap-normalize <file.mmap>\nRead-only JSON inspection. No editor or MindManager required.\n",
  );
} else if (
  !["inspect", "normalize"].includes(command) ||
  args.length !== 1 ||
  args[0].startsWith("--")
) {
  process.stderr.write("Usage: pnpm mmap-inspect <file.mmap> | pnpm mmap-normalize <file.mmap>\n");
  process.exitCode = 2;
} else {
  try {
    const stat = statSync(args[0]);
    if (!stat.isFile()) throw new Error("Input must be a regular file.");
    if (stat.size > MAX_PACKAGE_BYTES)
      throw new Error("Package exceeds the 64 MiB inspection limit.");
    const inspection = inspectMmap(readFileSync(args[0]), args[0]);
    process.stdout.write(
      command === "normalize"
        ? normalizeMmap(inspection)
        : `${JSON.stringify(inspection, null, 2)}\n`,
    );
    if (!inspection.valid) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(
      `MMAP inspection failed: ${error instanceof Error ? error.message : "Could not read input."}\n`,
    );
    process.exitCode = 1;
  }
}
