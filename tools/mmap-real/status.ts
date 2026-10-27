import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readManifest } from "../mmap-corpus/builder.ts";
import { REAL_ROOT, type RealManifest, readRealManifest } from "./manifest.ts";

interface ReviewedEvidence {
  id: string;
  packageEntries: { path: string }[];
  shape: { xml: { namespaces: { name: string }[] } };
  currentImportBaseline: { attempted: boolean; importsSuccessfully: boolean };
  analystReview: {
    featureObservations: { intent: string; status: string; notes: string }[];
    comparison: {
      syntheticId: string;
      category: string;
      reason: string;
      extraStructure: string[];
    }[];
  };
}

// Read only explicitly reviewed evidence at the registry's fixed safe path.
// A metadata declaration or a private candidate alone never supplies observations.
function reviewedEvidence(manifest: RealManifest): ReviewedEvidence[] {
  return manifest.samples.flatMap((sample) => {
    if (
      sample.inspectionStatus !== "inspected" ||
      sample.evidenceFile !== `evidence/${sample.id}.json` ||
      !sample.publicationReview.privacyReviewed ||
      sample.publicationReview.sensitiveMetadataFound ||
      sample.publicationReview.evidence !== `reviews/${sample.id}.md`
    )
      return [];
    const evidence = JSON.parse(readFileSync(resolve(REAL_ROOT, sample.evidenceFile), "utf8"));
    if (
      evidence.schemaVersion !== 1 ||
      evidence.id !== sample.id ||
      evidence.publicationStatus !== "sanitized-structure-reviewed" ||
      evidence.analystReview?.reviewStatus !== "sanitized-evidence-reviewed" ||
      evidence.shape?.inspectionCompleted !== true
    )
      throw new Error("Reviewed real evidence is inconsistent with its registry record.");
    return [evidence as ReviewedEvidence];
  });
}

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
  const reviewed = reviewedEvidence(manifest);
  const comparison = synthetic.fixtures.map((fixture) => {
    const declared = manifest.samples.filter((sample) =>
      sample.featureIntent.includes(fixture.feature),
    );
    const observed = reviewed.flatMap((evidence) =>
      evidence.analystReview.comparison
        .filter((row) => row.syntheticId === fixture.id)
        .map((row) => ({ evidence, row })),
    );
    return {
      syntheticId: fixture.id,
      syntheticStatus: fixture.status,
      realSampleIds: declared.map((sample) => sample.id).sort(),
      category: observed[0]?.row.category ?? (declared.length ? "UNKNOWN" : "NO_REAL_SAMPLE"),
      reason:
        observed[0]?.row.reason ??
        (declared.length
          ? "Analyst review of actual evidence is required; metadata alone does not establish a match."
          : "No genuine real sample has been acquired for this feature."),
      observedPackagePaths: observed.length
        ? observed[0].evidence.packageEntries.map((entry) => entry.path)
        : null,
      observedNamespaces: observed.length
        ? observed[0].evidence.shape.xml.namespaces.map((entry) => entry.name)
        : null,
      observedExtraStructure: observed.length ? observed[0].row.extraStructure : null,
    };
  });
  const featureInventory = support.map(([intent, feature, parser, writer]) => {
    const fixture = synthetic.fixtures.find((fixture) => fixture.feature === intent);
    const real = manifest.samples.filter((sample) => sample.featureIntent.includes(intent));
    const observations = reviewed.flatMap((evidence) =>
      evidence.analystReview.featureObservations
        .filter((row) => row.intent === intent)
        .map((row) => ({ id: evidence.id, ...row })),
    );
    return {
      feature,
      syntheticEvidence: fixture
        ? `${fixture.id}: ${fixture.status}`
        : "static audit / existing unit tests only",
      realEvidence: observations.length
        ? `${observations.map((row) => row.id).join(", ")}: reviewed structural evidence`
        : real.length
          ? `${real.length} declared record(s); evidence review required`
          : "NO_REAL_SAMPLE",
      currentParser: parser,
      currentWriter: writer,
      unknownPreservation: "NO",
      status:
        intent === "summary"
          ? "PENDING_FORMAT_EVIDENCE"
          : (observations[0]?.status ??
            (real.length ? "REVIEW_REQUIRED" : "SYNTHETIC_OR_STATIC_ONLY")),
      notes:
        observations[0]?.notes ??
        "P0B/accepted tests describe current code; no Oracle or real-file fidelity claim.",
    };
  });
  return {
    schemaVersion: 1,
    phase1Result: reviewed.length
      ? "REAL_INSPECTION_GATE_MET_REVIEW_PENDING"
      : manifest.samples.length
        ? "REVIEW_REQUIRED_REAL_EVIDENCE"
        : "BLOCKED ON REAL-CORPUS ACQUISITION",
    realSampleCount: manifest.samples.length,
    inspectedRealSampleDeclarations: manifest.samples.filter(
      (sample) => sample.inspectionStatus === "inspected",
    ).length,
    reviewedRealInspectionCount: reviewed.length,
    targetMatrix: manifest.targets,
    comparison,
    featureInventory,
    summaryDiscovery: "pending-format-evidence; no observed representation",
    currentImportBaseline: reviewed.some(
      (evidence) =>
        evidence.currentImportBaseline.attempted &&
        evidence.currentImportBaseline.importsSuccessfully,
    )
      ? "OBSERVED_ON_REAL_INPUT"
      : "NOT_OBSERVED_ON_REAL_INPUT",
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
    `Derived by \`pnpm --silent mmap-real:status --format markdown\` from the manifests, reviewed sanitized evidence and accepted P0B audit. Reviewed real inspections: **${status.reviewedRealInspectionCount}**. MM-01-minimal is REAL-001, private-local-only. MindManager 20.1.231 / Windows are observed document metadata, not Oracle verification.`,
    "",
    "| Feature | Synthetic Evidence | Real Evidence | Current Parser | Current Writer | Unknown Preservation | Status | Notes |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "`SYNTHETIC_OR_STATIC_ONLY` is not real-file verification. `PENDING_FORMAT_EVIDENCE` is not DISCOVERED/PARSED. No new structures are marked known merely because they are observed. Unknown preservation is absent; Phase 2 is not authorized.",
    "",
  ].join("\n");
}
