import { readFileSync, statSync } from "node:fs";
import { WORKSPACE_ROOT } from "./mmap-corpus/builder.ts";
import { intakeFile, validateLocalConfig } from "./mmap-real/intake.ts";
import { realCorpusStatus, renderFeatureInventory } from "./mmap-real/status.ts";

const [mode, ...args] = process.argv.slice(2);
try {
  if (mode === "status" && args.length === 0)
    process.stdout.write(`${JSON.stringify(realCorpusStatus(), null, 2)}\n`);
  else if (mode === "status" && args.join(" ") === "--format markdown")
    process.stdout.write(renderFeatureInventory());
  else if (mode === "intake" && args.length === 1) {
    if (!statSync(args[0]).isFile() || statSync(args[0]).size > 64 * 1024)
      throw new Error("INVALID_LOCAL_CONFIG");
    const config = validateLocalConfig(JSON.parse(readFileSync(args[0], "utf8")));
    const result = await intakeFile(config, WORKSPACE_ROOT);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.inspectionCompleted) process.exitCode = 1;
  } else {
    process.stderr.write(
      "Usage: pnpm mmap-real:status [--format markdown] | pnpm mmap-real:intake <private-config.json>\n",
    );
    process.exitCode = 2;
  }
} catch {
  // No original filename, filesystem exception, permission text or private metadata on stdout/stderr.
  process.stderr.write(
    "Real corpus command failed. Check the private configuration, permission and inspection limits; no publication was performed.\n",
  );
  process.exitCode = 1;
}
