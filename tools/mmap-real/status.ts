import { readManifest } from "../mmap-corpus/builder.ts";
import { type RealManifest, readRealManifest } from "./manifest.ts";

// Audit-derived support descriptions, not new parser/vocabulary support.
const support = [
  ["root-only", "Root / text", "parsed", "emitted; IDs regenerated"],
  ["three-level-tree", "Topic hierarchy", "parsed", "emitted"],
  ["notes", "Notes", "XHTML flattened to text", "preview text only"],
  ["links", "Hyperlinks", "primary safe URL", "primary safe URL"],
  ["icons", "Icons / markers", "curated mapping", "curated mapping only"],
  ["tags", "Tags", "names only", "names only"],
  ["task", "Tasks", "selected fields; dates truncated", "selected fields; progress rounded"],
  ["image", "Images", "selected raster images", "PNG/JPEG subset; metadata rewritten"],
  ["relationship", "Relationships", "endpoints/selected style", "endpoints/label; style lost"],
  ["boundary", "Boundaries", "subtree/selected style", "exact subtree only; style lost"],
  ["callout", "Callouts", "lifted to parent annotations", "omitted"],
  ["floating", "Floating topics", "detached trees; position lost", "detached trees; position lost"],
  ["summary", "Summary", "not parsed", "omitted"],
  ["attachments", "Attachments", "recognized file payloads", "omitted"],
  ["styles-layout", "Styles / layout", "selected explicit styles", "mostly omitted/defaulted"],
  ["unknown-extensions", "Unknown extensions", "not retained", "not preserved"],
];

/** Missing evidence stays missing. This is not a generic mmap-diff or a semantic comparer. */
export function realCorpusStatus(manifest: RealManifest = readRealManifest()) {
  const synthetic = readManifest();
  const comparison = synthetic.fixtures.map((fixture) => {
    const declared = manifest.samples.filter((sample) =>
      sample.featureIntent.includes(fixture.feature),
    );
    return {
      syntheticId: fixture.id,
      syntheticStatus: fixture.status,
      realSampleIds: declared.map((sample) => sample.id).sort(),
      category: declared.length ? "UNKNOWN" : "NO_REAL_SAMPLE",
      reason: declared.length
        ? "Analyst review of actual evidence is required; metadata alone does not establish a match."
        : "No genuine real sample has been acquired for this feature.",
      observedPackagePaths: null,
      observedNamespaces: null,
      observedExtraStructure: null,
    };
  });
  const featureInventory = support.map(([intent, feature, parser, writer]) => {
    const fixture = synthetic.fixtures.find((fixture) => fixture.feature === intent);
    const real = manifest.samples.filter((sample) => sample.featureIntent.includes(intent));
    return {
      feature,
      syntheticEvidence: fixture
        ? `${fixture.id}: ${fixture.status}`
        : "static audit / existing unit tests only",
      realEvidence: real.length
        ? `${real.length} declared record(s); evidence review required`
        : "NO_REAL_SAMPLE",
      currentParser: parser,
      currentWriter: writer,
      unknownPreservation: "NO",
      status:
        intent === "summary"
          ? "PENDING_FORMAT_EVIDENCE"
          : real.length
            ? "REVIEW_REQUIRED"
            : "SYNTHETIC_OR_STATIC_ONLY",
      notes: "P0B/accepted tests describe current code; no Oracle or real-file fidelity claim.",
    };
  });
  return {
    schemaVersion: 1,
    phase1Result: manifest.samples.length
      ? "REVIEW_REQUIRED_REAL_EVIDENCE"
      : "BLOCKED ON REAL-CORPUS ACQUISITION",
    realSampleCount: manifest.samples.length,
    inspectedRealSampleDeclarations: manifest.samples.filter(
      (sample) => sample.inspectionStatus === "inspected",
    ).length,
    targetMatrix: manifest.targets,
    comparison,
    featureInventory,
    summaryDiscovery: "pending-format-evidence; no observed representation",
    noOpBaseline: "NOT_OBSERVED_ON_REAL_INPUT",
  };
}
export function renderFeatureInventory(): string {
  const status = realCorpusStatus();
  const rows = status.featureInventory.map(
    (row) =>
      `| ${row.feature} | ${row.syntheticEvidence} | ${row.realEvidence} | ${row.currentParser} | ${row.currentWriter} | ${row.unknownPreservation} | ${row.status} | ${row.notes} |`,
  );
  return [
    "# Phase 1 feature inventory",
    "",
    `Phase 1 result: **${status.phase1Result}**.`,
    "",
    "Derived by `pnpm --silent mmap-real:status --format markdown` from the synthetic/real manifests and the accepted P0B code audit. Metadata declarations alone do not prove real provenance. No genuine real sample has been supplied in this batch.",
    "",
    "| Feature | Synthetic Evidence | Real Evidence | Current Parser | Current Writer | Unknown Preservation | Status | Notes |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "`SYNTHETIC_OR_STATIC_ONLY` is not real-file verification. `PENDING_FORMAT_EVIDENCE` is not DISCOVERED/PARSED. No new structures are marked known merely because they are observed. Unknown preservation is absent; Phase 2 is not authorized.",
    "",
  ].join("\n");
}
