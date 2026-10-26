import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const REAL_ROOT = fileURLToPath(
  new URL("../../test/fixtures/mmap-corpus/real-public/", import.meta.url),
);
export const PROVENANCE = [
  "mindmanager-generated-synthetic-content",
  "sanitized-real-world",
  "public-authorized-sample",
  "private-local-only",
] as const;
export const TARGETS = [
  "modern-minimal",
  "modern-feature-mixed",
  "deep-map",
  "wide-map",
  "large-map",
  "multiple-images",
  "attachment",
  "legacy",
];
type Provenance = (typeof PROVENANCE)[number];
export const PUBLIC_SAMPLE_FIELDS = [
  "id",
  "provenanceClass",
  "producer",
  "producerVersion",
  "platform",
  "generation",
  "sourceDescription",
  "acquisitionMethod",
  "licenseOrPermission",
  "publicCommitAllowed",
  "rawCommitted",
  "sanitized",
  "contentSynthetic",
  "inspectionStatus",
  "fixtureFile",
  "evidenceFile",
  "sha256",
  "normalizedInspectionFingerprint",
  "sanitizedStructuralFingerprint",
  "fingerprintPublicationAllowed",
  "featureIntent",
  "limitations",
  "publicationReview",
];
export interface RealSample {
  id: string;
  provenanceClass: Provenance;
  producer: string | null;
  producerVersion: string | null;
  platform: string | null;
  generation: string | null;
  sourceDescription: string;
  acquisitionMethod: string;
  licenseOrPermission: string;
  publicCommitAllowed: boolean;
  rawCommitted: boolean;
  sanitized: boolean;
  contentSynthetic: boolean | null;
  inspectionStatus: "pending" | "inspected" | "rejected" | "limit-conflict";
  fixtureFile: string | null;
  evidenceFile: string | null;
  sha256: string | null;
  normalizedInspectionFingerprint: string | null;
  sanitizedStructuralFingerprint: string | null;
  fingerprintPublicationAllowed: boolean;
  featureIntent: string[];
  limitations: string[];
  publicationReview: {
    permissionVerified: boolean;
    privacyReviewed: boolean;
    sensitiveMetadataFound: boolean;
    evidence: string | null;
  };
}
export interface RealManifest {
  schemaVersion: 1;
  corpus: "mindloom-phase1-real";
  acquisitionStatus: "BLOCKED ON REAL-CORPUS ACQUISITION" | "evidence-available";
  defaultPrivacy: "private-until-reviewed";
  samples: RealSample[];
  targets: {
    id: string;
    status: "acquired" | "local-only" | "pending" | "unavailable";
    sampleIds: string[];
  }[];
  limitations: string[];
}
export function opaqueId(value: unknown): asserts value is string {
  if (typeof value !== "string" || !/^REAL-\d{3}$/.test(value))
    throw new Error("An opaque REAL-nnn ID is required.");
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a manifest object.");
  return value as Record<string, unknown>;
}
function fields(value: Record<string, unknown>, allowed: string[], required = allowed): void {
  if (
    Object.keys(value).some((key) => !allowed.includes(key)) ||
    required.some((key) => !Object.hasOwn(value, key))
  )
    throw new Error("Unknown or missing committed metadata fields.");
}
function stringList(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item))
    throw new Error("Expected a string list.");
}
function safeText(value: unknown): void {
  if (
    typeof value !== "string" ||
    !value ||
    /\b[A-Za-z]:[\\/]|file:\/\/|\/Users\/|\/home\/|\\\\|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(value)
  )
    throw new Error("Sensitive path/email markers are not permitted in committed metadata.");
}

/** Publication policy validation, not proof of actual permission or privacy review. */
export function validateRealManifest(input: unknown): RealManifest {
  const manifest = object(input);
  if (manifest.$schema !== undefined && manifest.$schema !== "./manifest.schema.json")
    throw new Error("Unexpected schema reference.");
  fields(
    manifest,
    [
      "$schema",
      "schemaVersion",
      "corpus",
      "acquisitionStatus",
      "defaultPrivacy",
      "samples",
      "targets",
      "limitations",
    ],
    [
      "schemaVersion",
      "corpus",
      "acquisitionStatus",
      "defaultPrivacy",
      "samples",
      "targets",
      "limitations",
    ],
  );
  if (
    manifest.schemaVersion !== 1 ||
    manifest.corpus !== "mindloom-phase1-real" ||
    manifest.defaultPrivacy !== "private-until-reviewed"
  )
    throw new Error("Invalid real corpus identity/privacy policy.");
  if (!Array.isArray(manifest.samples) || !Array.isArray(manifest.targets))
    throw new Error("Samples and targets are required.");
  stringList(manifest.limitations);
  for (const limitation of manifest.limitations) safeText(limitation);
  const ids = new Set<string>();
  for (const value of manifest.samples) {
    const sample = object(value);
    fields(sample, PUBLIC_SAMPLE_FIELDS);
    opaqueId(sample.id);
    if (ids.has(sample.id)) throw new Error("Duplicate sample ID.");
    ids.add(sample.id);
    if (!PROVENANCE.includes(sample.provenanceClass as Provenance))
      throw new Error("Unknown provenance class.");
    for (const field of ["sourceDescription", "acquisitionMethod", "licenseOrPermission"])
      safeText(sample[field]);
    for (const field of ["producer", "producerVersion", "platform", "generation"])
      if (sample[field] !== null) safeText(sample[field]);
    for (const field of ["featureIntent", "limitations"]) {
      stringList(sample[field]);
      for (const text of sample[field] as string[]) safeText(text);
    }
    for (const field of [
      "publicCommitAllowed",
      "rawCommitted",
      "sanitized",
      "fingerprintPublicationAllowed",
    ])
      if (typeof sample[field] !== "boolean")
        throw new Error("Explicit publication flags are required.");
    if (sample.contentSynthetic !== null && typeof sample.contentSynthetic !== "boolean")
      throw new Error("Content provenance must be explicit.");
    if (
      !["pending", "inspected", "rejected", "limit-conflict"].includes(
        sample.inspectionStatus as string,
      )
    )
      throw new Error("Unknown inspection status.");
    if (sample.fixtureFile !== null && sample.fixtureFile !== `packages/${sample.id}.mmap`)
      throw new Error("Unsafe public fixture path.");
    if (sample.evidenceFile !== null && sample.evidenceFile !== `evidence/${sample.id}.json`)
      throw new Error("Unsafe evidence path.");
    const review = object(sample.publicationReview);
    fields(review, ["permissionVerified", "privacyReviewed", "sensitiveMetadataFound", "evidence"]);
    for (const field of ["permissionVerified", "privacyReviewed", "sensitiveMetadataFound"])
      if (typeof review[field] !== "boolean")
        throw new Error("Explicit publication review flags are required.");
    if (review.evidence !== null && review.evidence !== `reviews/${sample.id}.md`)
      throw new Error("Unsafe review evidence path.");
    for (const field of [
      "sha256",
      "normalizedInspectionFingerprint",
      "sanitizedStructuralFingerprint",
    ]) {
      if (
        sample[field] !== null &&
        (typeof sample[field] !== "string" || !/^[0-9a-f]{64}$/.test(sample[field] as string))
      )
        throw new Error("Invalid fingerprint.");
    }
    if (
      sample.provenanceClass === "private-local-only" &&
      (sample.rawCommitted ||
        sample.publicCommitAllowed ||
        sample.fixtureFile !== null ||
        sample.sha256 !== null ||
        sample.normalizedInspectionFingerprint !== null ||
        sample.fingerprintPublicationAllowed)
    )
      throw new Error(
        "Private samples must not publish raw files, names or correlating fingerprints.",
      );
    if (
      sample.rawCommitted &&
      (!sample.publicCommitAllowed ||
        sample.fixtureFile === null ||
        sample.sha256 === null ||
        !review.permissionVerified ||
        !review.privacyReviewed ||
        review.sensitiveMetadataFound ||
        review.evidence === null)
    )
      throw new Error("Raw publication requires documented permission and privacy review.");
    if (!sample.rawCommitted && sample.fixtureFile !== null)
      throw new Error("Uncommitted raw samples cannot claim a public fixture.");
    if (
      (sample.sha256 !== null || sample.normalizedInspectionFingerprint !== null) &&
      !sample.fingerprintPublicationAllowed
    )
      throw new Error("Fingerprint publication requires explicit review.");
    if (
      (sample.fingerprintPublicationAllowed ||
        sample.evidenceFile !== null ||
        sample.sanitizedStructuralFingerprint !== null) &&
      (!review.privacyReviewed || review.sensitiveMetadataFound || review.evidence === null)
    )
      throw new Error("Public structural evidence requires a documented privacy review.");
    if (
      sample.provenanceClass === "mindmanager-generated-synthetic-content" &&
      sample.contentSynthetic !== true
    )
      throw new Error("Controlled synthetic content must be explicitly declared.");
    if (sample.provenanceClass === "sanitized-real-world" && sample.sanitized !== true)
      throw new Error("Sanitized provenance requires a recorded procedure.");
  }
  const targetIds = new Set<string>();
  const samplesById = new Map(
    manifest.samples.map((value) => {
      const sample = object(value);
      return [sample.id, sample];
    }),
  );
  for (const value of manifest.targets) {
    const target = object(value);
    fields(target, ["id", "status", "sampleIds"]);
    if (!TARGETS.includes(target.id as string) || targetIds.has(target.id as string))
      throw new Error("Invalid target matrix.");
    targetIds.add(target.id as string);
    stringList(target.sampleIds);
    if (!["acquired", "local-only", "pending", "unavailable"].includes(target.status as string))
      throw new Error("Unknown acquisition status.");
    if (
      target.sampleIds.some((id) => !ids.has(id)) ||
      ((target.status === "pending" || target.status === "unavailable") &&
        target.sampleIds.length) ||
      ((target.status === "acquired" || target.status === "local-only") && !target.sampleIds.length)
    )
      throw new Error("Target acquisition evidence is inconsistent.");
    if (
      target.sampleIds.some((id) =>
        target.status === "acquired"
          ? samplesById.get(id)?.provenanceClass === "private-local-only"
          : target.status === "local-only" && samplesById.get(id)?.rawCommitted,
      )
    )
      throw new Error("Public/private target classification is inconsistent.");
  }
  if (targetIds.size !== TARGETS.length)
    throw new Error("All real corpus targets must be represented.");
  if (
    !["BLOCKED ON REAL-CORPUS ACQUISITION", "evidence-available"].includes(
      manifest.acquisitionStatus as string,
    ) ||
    (manifest.samples.length === 0 &&
      manifest.acquisitionStatus !== "BLOCKED ON REAL-CORPUS ACQUISITION")
  )
    throw new Error("Empty acquisition cannot claim completion.");
  return manifest as unknown as RealManifest;
}
export function readRealManifest(): RealManifest {
  return validateRealManifest(
    JSON.parse(
      readFileSync(
        new URL("../../test/fixtures/mmap-corpus/real-public/manifest.json", import.meta.url),
        "utf8",
      ),
    ),
  );
}
