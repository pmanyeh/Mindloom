// Maploom Phase 0: normalize pnpm's installed-package metadata without local paths.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => JSON.parse(readFileSync(resolve(path), "utf8").replace(/^\uFEFF/, ""));
const all = read(".tmp/phase0-toolchain/licenses.json");
const production = read(".tmp/phase0-toolchain/licenses-prod.json");
const manifest = read("package.json");
const directVersions = new Map(
  [...Object.keys(manifest.dependencies), ...Object.keys(manifest.devDependencies)].map((name) => [
    name,
    read(`node_modules/${name}/package.json`).version,
  ]),
);
const key = (name, version) => `${name}@${version}`;
const prodKeys = new Set(
  Object.values(production).flatMap((group) =>
    group.flatMap((pkg) => pkg.versions.map((version) => key(pkg.name, version))),
  ),
);
const packages = Object.entries(all)
  .flatMap(([license, group]) =>
    group.flatMap((pkg) =>
      pkg.versions.map((version) => ({
        name: pkg.name,
        version,
        license,
        scope: prodKeys.has(key(pkg.name, version)) ? "production-graph" : "development-only",
        direct:
          directVersions.get(pkg.name) !== version
            ? false
            : Object.hasOwn(manifest.dependencies, pkg.name)
              ? "runtime"
              : Object.hasOwn(manifest.devDependencies, pkg.name)
                ? "development"
                : false,
        use: prodKeys.has(key(pkg.name, version))
          ? "application dependency graph"
          : "build/test tooling",
        distributionImpact: license.includes("MPL")
          ? "Build tool; retain MPL terms if redistributing tool/source. Not an application runtime dependency."
          : license === "CC-BY-4.0"
            ? "Build-time browser data; assess attribution in published artifacts."
            : "Retain applicable license/copyright notices; choose MIT where offered as an alternative.",
        approvedFor:
          "Phase 0 local build/audit; artifact redistribution requires notices/package review",
        ...(pkg.homepage ? { homepage: pkg.homepage } : {}),
      })),
    ),
  )
  .sort((a, b) => key(a.name, a.version).localeCompare(key(b.name, b.version), "en"));

const output = {
  baseline: "65964ac06937514cf9805a2b1198cc20f1e83425",
  platform: "win32-x64",
  source: "pnpm 11.0.9 licenses list --json / --prod --json, frozen lockfile install",
  limitation:
    "Installed Windows dependency graph; not an artifact SBOM or other-platform inventory.",
  packageCount: packages.length,
  packages,
};
writeFileSync(
  "docs/audit/evidence/dependency-licenses.json",
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(`Recorded ${packages.length} package/version records; local paths omitted.`);
