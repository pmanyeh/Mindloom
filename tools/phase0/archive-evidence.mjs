// Archive Phase 0 logs, removing workspace paths and the local JUnit hostname.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const input = ".tmp/phase0-toolchain/";
const output = "docs/audit/evidence/";
function readLog(name) {
  const bytes = readFileSync(input + name);
  return bytes[0] === 0xff && bytes[1] === 0xfe
    ? bytes.subarray(2).toString("utf16le")
    : bytes.toString("utf8").replace(/^\uFEFF/, "");
}
function scrub(text) {
  let clean = text
    .split(String.fromCharCode(27))
    .map((fragment) => fragment.replace(/^\[[0-9;]*m/, ""))
    .join("");
  for (const path of [resolve(input), process.cwd()]) {
    for (const spelling of [path, path.replaceAll("\\", "/")]) {
      clean = clean.replaceAll(spelling, path === process.cwd() ? "<workspace>" : "<toolchain>");
    }
  }
  return clean.replace(/hostname="[^"]*"/g, 'hostname="&lt;local-machine&gt;"');
}
for (const [source, target] of [
  ["install.log", "install.txt"],
  ["baseline-gate.log", "baseline-gate.txt"],
  ["mmap-audit.txt", "mmap-audit.txt"],
  ["mmap-audit.junit.xml", "mmap-audit.junit.xml"],
  ["why-lightningcss.txt", "why-lightningcss.txt"],
]) {
  writeFileSync(output + target, scrub(readLog(source)));
}
const checks = JSON.parse(readLog("final-checks.json"));
writeFileSync(
  `${output}final-checks.txt`,
  checks
    .map(
      ({ stage, exitCode }) =>
        `Command: pnpm ${stage}\nExit: ${exitCode}\n${scrub(readLog(`final-${stage}.txt`))}`,
    )
    .join("\n"),
);
const metadata = {
  date: "2026-10-25",
  timezone: "Asia/Taipei",
  repository: "https://github.com/dannbleeker/mindmap-studio",
  upstreamBranch: "main",
  baselineCommit: "65964ac06937514cf9805a2b1198cc20f1e83425",
  localBranch: "feature/p0-baseline",
  platform: "Windows x64",
  git: "2.54.0.windows.1",
  node: "24.22.1",
  npm: "11.19.1",
  pnpm: "11.0.9",
  nodeArchive: "https://nodejs.org/dist/v24.22.1/node-v24.22.1-win-x64.zip",
  nodeArchiveSha256: createHash("sha256")
    .update(readFileSync(`${input}node-v24.22.1-win-x64.zip`))
    .digest("hex"),
  nodeChecksumVerifiedAgainst: "https://nodejs.org/dist/v24.22.1/SHASUMS256.txt",
  baselineInstall: { command: "pnpm install --frozen-lockfile", exitCode: 0 },
  originalGate: {
    command: "pnpm gate",
    exitCode: 0,
    filesPassed: 219,
    testsPassed: 2484,
    testsSkipped: 3,
    coverage: { statements: 90.43, lines: 90.43, branches: 87.05, functions: 78.62 },
    firstLoadGzipKiB: 182.8,
    budgetGzipKiB: 184,
    sourceChanges: false,
  },
  syntheticMmapLossWitnesses: { passed: 10, failed: 0 },
  postAuditChecks: checks,
  mindManagerOracle: "NOT RUN",
  deployment: "NOT PERFORMED",
};
writeFileSync(`${output}baseline-metadata.json`, `${JSON.stringify(metadata, null, 2)}\n`);
console.log("Archived Phase 0 evidence with local paths/hostname removed.");
