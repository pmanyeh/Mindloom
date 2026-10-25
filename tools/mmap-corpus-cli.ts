// Generate the reviewed synthetic corpus into a fixed ignored workspace directory.
import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { inspectMmap } from "../src/formats/mmap/inspector.ts";
import { normalizeMmap } from "../src/formats/mmap/normalize.ts";
import { WORKSPACE_ROOT, buildFixture, readManifest } from "./mmap-corpus/builder.ts";

if (process.argv.length > 2) {
  process.stderr.write(
    "Usage: pnpm mmap-corpus:generate (fixed output: .tmp/mmap-corpus/synthetic)\n",
  );
  process.exitCode = 2;
} else {
  try {
    const manifest = readManifest();
    let output = WORKSPACE_ROOT;
    for (const segment of [".tmp", "mmap-corpus", "synthetic"]) {
      output = resolve(output, segment);
      if (!lstatSync(output, { throwIfNoEntry: false })) mkdirSync(output);
      const stat = lstatSync(output);
      if (stat.isSymbolicLink() || !stat.isDirectory())
        throw new Error("Output directory must not contain symlinks or non-directories.");
    }
    const write = (name: string, data: Uint8Array | string) => {
      const destination = resolve(output, name);
      const stat = lstatSync(destination, { throwIfNoEntry: false });
      if (stat) {
        if (stat.isSymbolicLink() || !stat.isFile())
          throw new Error("Refusing to overwrite a symlink or non-file.");
      }
      writeFileSync(destination, data);
    };
    const fixtures = manifest.fixtures.map((fixture) => {
      if (fixture.status === "pending-format-evidence") {
        for (const suffix of [".mmap", ".inspect.json", ".normalized.json"]) {
          if (lstatSync(resolve(output, fixture.id + suffix), { throwIfNoEntry: false }))
            throw new Error(
              `Pending slot ${fixture.id} has a stale generated artifact; inspect it manually.`,
            );
        }
        return { id: fixture.id, status: fixture.status, sha256: null };
      }
      const bytes = buildFixture(fixture);
      const inspection = inspectMmap(bytes, `${fixture.id}.mmap`);
      if (!inspection.valid)
        throw new Error(`${fixture.id} failed inspection: ${JSON.stringify(inspection.issues)}`);
      write(`${fixture.id}.mmap`, bytes);
      write(`${fixture.id}.inspect.json`, `${JSON.stringify(inspection, null, 2)}\n`);
      write(`${fixture.id}.normalized.json`, normalizeMmap(inspection));
      return {
        id: fixture.id,
        status: fixture.status,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      };
    });
    const index = {
      corpus: manifest.corpus,
      outputDirectory: ".tmp/mmap-corpus/synthetic",
      fixtures,
    };
    const json = `${JSON.stringify(index, null, 2)}\n`;
    write("index.json", json);
    process.stdout.write(json);
  } catch (error) {
    process.stderr.write(
      `Corpus generation failed: ${error instanceof Error ? error.message : "unknown error"}\n`,
    );
    process.exitCode = 1;
  }
}
