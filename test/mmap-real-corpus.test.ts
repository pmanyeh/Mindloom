// These are manufactured workflow/security probes, NOT acquired real samples.
// No test input below enters the real-public manifest or demonstrates MindManager validity.
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  truncateSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { inspectMmap } from "../src/formats/mmap/inspector";
import { normalizeMmap } from "../src/formats/mmap/normalize";
import {
  type LocalConfig,
  inspectLocalBytes,
  intakeFile,
  sanitizedStructure,
  validateLocalConfig,
} from "../tools/mmap-real/intake";
import {
  PUBLIC_SAMPLE_FIELDS,
  REAL_ROOT,
  type RealSample,
  readRealManifest,
  validateRealManifest,
} from "../tools/mmap-real/manifest";
import { realCorpusStatus, renderFeatureInventory } from "../tools/mmap-real/status";

const AP = "http://schemas.mindjet.com/MindManager/Application/2003";
const syntheticXml = `<PrivatePrefix:Map xmlns:PrivatePrefix="${AP}" xmlns:SecretNamespace="urn:DO-NOT-PUBLISH"><PrivatePrefix:OneTopic><PrivatePrefix:Topic OId="private-id"><PrivatePrefix:Text PlainText="DO-NOT-PUBLISH"/><SecretNamespace:SecretClient SecretAttribute="secret@example.invalid"/></PrivatePrefix:Topic></PrivatePrefix:OneTopic></PrivatePrefix:Map>`;
const zip = (xml = syntheticXml, extras: Record<string, Uint8Array> = {}) =>
  zipSync({ "Document.xml": strToU8(xml), ...extras }, { mtime: new Date(1980, 0, 1) });
const config = (path = "not-read-by-byte-tests"): LocalConfig => ({
  schemaVersion: 1,
  id: "REAL-997",
  inputPath: path,
  provenanceClass: "private-local-only",
  producer: null,
  producerVersion: null,
  platform: null,
  contentSynthetic: null,
  sanitized: false,
  localInspectionAllowed: true,
  permissionEvidence: "Manufactured workflow test only; no acquired source.",
  captureCurrentImport: false,
});
function mockSample(): RealSample {
  return {
    id: "REAL-999",
    provenanceClass: "private-local-only",
    producer: null,
    producerVersion: null,
    platform: null,
    generation: null,
    sourceDescription: "Manufactured metadata policy probe only",
    acquisitionMethod: "test-only",
    licenseOrPermission: "Test-only declaration; not acquired content",
    publicCommitAllowed: false,
    rawCommitted: false,
    sanitized: false,
    contentSynthetic: null,
    inspectionStatus: "pending",
    fixtureFile: null,
    evidenceFile: null,
    sha256: null,
    normalizedInspectionFingerprint: null,
    sanitizedStructuralFingerprint: null,
    fingerprintPublicationAllowed: false,
    featureIntent: ["root-only"],
    limitations: ["Not an actual sample"],
    publicationReview: {
      permissionVerified: false,
      privacyReviewed: false,
      sensitiveMetadataFound: false,
      evidence: null,
    },
  };
}
function registryWith(sample: RealSample) {
  const manifest = structuredClone(readRealManifest());
  manifest.samples.push(sample);
  manifest.targets[0] = { id: "modern-minimal", status: "local-only", sampleIds: [sample.id] };
  return manifest;
}
function sandbox() {
  const directory = mkdtempSync(join(tmpdir(), "mindloom-real-intake-"));
  return {
    directory,
    close() {
      if (!directory.startsWith(join(tmpdir(), "mindloom-real-intake-")))
        throw new Error("Unexpected cleanup target");
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

describe("real corpus acquisition registry — no genuine files supplied", () => {
  it("keeps acquisition BLOCKED with zero samples and all eight targets pending", () => {
    const manifest = readRealManifest();
    expect(manifest.samples).toEqual([]);
    expect(manifest.acquisitionStatus).toBe("BLOCKED ON REAL-CORPUS ACQUISITION");
    expect(manifest.targets.map((target) => target.id)).toEqual([
      "modern-minimal",
      "modern-feature-mixed",
      "deep-map",
      "wide-map",
      "large-map",
      "multiple-images",
      "attachment",
      "legacy",
    ]);
    expect(
      manifest.targets.every(
        (target) => target.status === "pending" && target.sampleIds.length === 0,
      ),
    ).toBe(true);
    expect(readdirSync(REAL_ROOT).filter((file) => file.endsWith(".mmap"))).toEqual([]);
    // No vacuous "real fixtures passed" assertion: there is explicitly no real-file test evidence.
  });

  it("publishes a machine-readable schema covering every required sample field", () => {
    const schema = JSON.parse(readFileSync(resolve(REAL_ROOT, "manifest.schema.json"), "utf8"));
    expect([...schema.$defs.sample.required].sort()).toEqual([...PUBLIC_SAMPLE_FIELDS].sort());
    expect(schema.$defs.sample.additionalProperties).toBe(false);
    expect(schema.$defs.sample.properties.provenanceClass.enum).toHaveLength(4);
    expect(validateRealManifest(readRealManifest())).toEqual(readRealManifest());
  });

  it("rejects false completion, missing provenance and extra private metadata fields", () => {
    const empty = readRealManifest();
    expect(() =>
      validateRealManifest({ ...empty, acquisitionStatus: "evidence-available" }),
    ).toThrow(/Empty acquisition/);
    const sample = mockSample();
    expect(validateRealManifest(registryWith(sample)).samples).toHaveLength(1);
    expect(() =>
      validateRealManifest(
        registryWith({ ...sample, provenanceClass: "synthetic" } as unknown as RealSample),
      ),
    ).toThrow(/provenance/);
    expect(() =>
      validateRealManifest(
        registryWith({ ...sample, inputPath: "DO-NOT-PUBLISH" } as unknown as RealSample),
      ),
    ).toThrow(/metadata fields/);
    expect(() => validateRealManifest({ ...empty, inputPath: "DO-NOT-PUBLISH" })).toThrow(
      /metadata fields/,
    );
  });

  it.each([
    { label: "Windows path", marker: "C:/private/file.mmap" },
    { label: "file URI", marker: "file:///private/input" },
    { label: "POSIX home", marker: "/home/private/input" },
    { label: "email", marker: "user@example.invalid" },
  ])("rejects sensitive committed metadata markers: $label", ({ marker }) => {
    expect(() =>
      validateRealManifest(registryWith({ ...mockSample(), sourceDescription: marker })),
    ).toThrow(/Sensitive/);
  });

  it("prevents private rows from publishing raw paths, raw packages or correlating hashes", () => {
    for (const change of [
      { rawCommitted: true },
      { publicCommitAllowed: true },
      { fixtureFile: "packages/REAL-999.mmap" },
      { sha256: "a".repeat(64) },
      { normalizedInspectionFingerprint: "b".repeat(64) },
      { fingerprintPublicationAllowed: true },
    ]) {
      expect(() => validateRealManifest(registryWith({ ...mockSample(), ...change }))).toThrow(
        /Private/,
      );
    }
    expect(() =>
      validateRealManifest(
        registryWith({ ...mockSample(), evidenceFile: "evidence/REAL-999.json" }),
      ),
    ).toThrow(/privacy review/);
  });

  it("requires explicit permission/privacy evidence before even a policy record can claim public raw inclusion", () => {
    const sample: RealSample = {
      ...mockSample(),
      provenanceClass: "public-authorized-sample",
      publicCommitAllowed: true,
      rawCommitted: true,
      fixtureFile: "packages/REAL-999.mmap",
      sha256: "a".repeat(64),
      fingerprintPublicationAllowed: true,
      publicationReview: {
        permissionVerified: true,
        privacyReviewed: true,
        sensitiveMetadataFound: false,
        evidence: "reviews/REAL-999.md",
      },
    };
    const registry = registryWith(sample);
    registry.targets[0].status = "acquired";
    expect(validateRealManifest(registry).samples[0].rawCommitted).toBe(true); // policy shape only; no file acquired
    for (const change of [
      { permissionVerified: false },
      { privacyReviewed: false },
      { sensitiveMetadataFound: true },
      { evidence: null },
    ]) {
      expect(() =>
        validateRealManifest({
          ...registry,
          samples: [{ ...sample, publicationReview: { ...sample.publicationReview, ...change } }],
        }),
      ).toThrow(/review/);
    }
    expect(() =>
      validateRealManifest({
        ...registry,
        samples: [{ ...sample, fixtureFile: "../outside.mmap" }],
      }),
    ).toThrow(/fixture path/);
  });

  it("enforces controlled-content and public/private target distinctions", () => {
    expect(() =>
      validateRealManifest(
        registryWith({
          ...mockSample(),
          provenanceClass: "mindmanager-generated-synthetic-content",
          contentSynthetic: false,
        }),
      ),
    ).toThrow(/synthetic content/);
    expect(() =>
      validateRealManifest(
        registryWith({
          ...mockSample(),
          provenanceClass: "sanitized-real-world",
          sanitized: false,
        }),
      ),
    ).toThrow(/Sanitized/);
    const registry = registryWith(mockSample());
    registry.targets[0].status = "acquired";
    expect(() => validateRealManifest(registry)).toThrow(/classification/);
    const invalidTarget = readRealManifest();
    invalidTarget.targets[0] = { id: "modern-minimal", status: "pending", sampleIds: ["REAL-999"] };
    expect(() => validateRealManifest(invalidTarget)).toThrow(/inconsistent/);
  });

  it("derives deterministic NO_REAL_SAMPLE comparisons and an honest feature inventory", () => {
    const first = realCorpusStatus();
    expect(first).toEqual(realCorpusStatus());
    expect(first.realSampleCount).toBe(0);
    expect(first.comparison).toHaveLength(14);
    expect(
      first.comparison.every(
        (row) => row.category === "NO_REAL_SAMPLE" && row.observedNamespaces === null,
      ),
    ).toBe(true);
    expect(
      first.featureInventory.every(
        (row) => row.realEvidence === "NO_REAL_SAMPLE" && row.unknownPreservation === "NO",
      ),
    ).toBe(true);
    expect(first.summaryDiscovery).toContain("pending-format-evidence");
    expect(first.noOpBaseline).toBe("NOT_OBSERVED_ON_REAL_INPUT");
    expect(realCorpusStatus(registryWith(mockSample())).comparison[0].category).toBe("UNKNOWN");
    expect(readFileSync(resolve("docs/compatibility/PHASE1_FEATURE_INVENTORY.md"), "utf8")).toBe(
      renderFeatureInventory(),
    );
  });
});

describe("local-only intake — manufactured privacy/security probes", () => {
  it("rejects the unfilled template and requires recorded local permission and opaque IDs", () => {
    const template = JSON.parse(readFileSync("tools/mmap-real/local-intake.example.json", "utf8"));
    expect(() => validateLocalConfig(template)).toThrow();
    expect(() => validateLocalConfig({ ...config(), localInspectionAllowed: false })).toThrow(
      /PERMISSION/,
    );
    expect(() => validateLocalConfig({ ...config(), permissionEvidence: "" })).toThrow(
      /PERMISSION/,
    );
    expect(() => validateLocalConfig({ ...config(), id: "../escape" })).toThrow(/opaque/);
    expect(() =>
      validateLocalConfig({ ...config(), producerVersion: "private@example.invalid" }),
    ).toThrow(/VERSION/);
  });

  it("retains detailed local inventory while anonymizing names, prefixes, namespaces, paths and fingerprints", async () => {
    const bytes = zip(syntheticXml, {
      "secret-client/attachment-private.bin": strToU8("DO-NOT-PUBLISH"),
    });
    const report = await inspectLocalBytes(bytes, config());
    expect(report.inspection.valid).toBe(true);
    expect(report.normalized).toContain("SecretClient"); // private output really retains discovery detail
    const candidate = JSON.stringify(report.candidate);
    for (const marker of [
      "SecretClient",
      "SecretAttribute",
      "SecretNamespace",
      "PrivatePrefix",
      "DO-NOT-PUBLISH",
      "secret-client",
      "private-id",
      "example.invalid",
      report.packageSha256,
      report.normalizedFingerprint,
    ])
      expect(candidate).not.toContain(marker);
    expect(report.candidate.publicCommitAllowed).toBe(false);
    expect(report.candidate.oracleVerified).toBe(false);
    expect(
      report.candidate.shape.xml.elements.some((entry) => entry.name.includes("[unrecognized]")),
    ).toBe(true);
    expect(report.candidate.shape.package.unrecognizedEntries).toBe(1);
    expect(report.candidate.sanitizedStructuralFingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect((await inspectLocalBytes(bytes, config())).candidate).toEqual(report.candidate);
    expect(normalizeMmap(inspectMmap(bytes))).toBe(report.normalized);
  });

  it("aggregates sanitized counts without expanding each occurrence into memory", () => {
    const report = inspectMmap(zip());
    const item = report.document.inventory?.elements.find(
      (entry) => entry.localName === "SecretClient",
    );
    if (!item) throw new Error("Expected artificial unknown");
    item.count = 10_000_000;
    expect(
      sanitizedStructure(report).xml.elements.find(
        (entry) => entry.name === "unrecognized:[unrecognized]",
      )?.count,
    ).toBe(10_000_000);
  });

  it.each(["utf-8", "utf-16le"])(
    "rejects external entities/DTD before parsing (%s)",
    async (encoding) => {
      const xml =
        '<!DOCTYPE Map [<!ENTITY secret SYSTEM "https://example.invalid/never-fetch">]><Map>&secret;</Map>';
      const data = encoding === "utf-16le" ? Buffer.from(`\ufeff${xml}`, "utf16le") : strToU8(xml);
      await expect(inspectLocalBytes(zipSync({ "Document.xml": data }), config())).rejects.toThrow(
        /DTD_ENTITY_REJECTED/,
      );
    },
  );

  it("rejects malformed, encrypted and oversized-document inputs without relaxing Batch 1 limits", async () => {
    await expect(inspectLocalBytes(strToU8("not ZIP"), config())).rejects.toThrow(/ZIP/);
    const oversized = zip();
    const view = new DataView(oversized.buffer, oversized.byteOffset, oversized.byteLength);
    const central = view.getUint32(oversized.length - 6, true);
    view.setUint32(central + 24, 17 * 1024 * 1024, true);
    await expect(inspectLocalBytes(oversized, config())).rejects.toThrow(/DOCUMENT_LIMIT/);
    const encrypted = zip();
    const encryptView = new DataView(encrypted.buffer, encrypted.byteOffset, encrypted.byteLength);
    encryptView.setUint16(encryptView.getUint32(encrypted.length - 6, true) + 8, 1, true);
    await expect(inspectLocalBytes(encrypted, config())).rejects.toThrow(/encrypted/);
    const malformed = await inspectLocalBytes(zip("<Map><Topic></Map>"), config());
    expect(malformed.candidate.shape.inspectionCompleted).toBe(false);
    expect(malformed.candidate.shape.issueCodes).toEqual(["DOCUMENT_INSPECTION_FAILED"]);
  });

  it("does not unzip resource bombs for the optional existing-import baseline", async () => {
    const bytes = zip(syntheticXml, {
      "bin/bomb.bin": strToU8("tiny artificial compressed bytes"),
    });
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let central = view.getUint32(bytes.length - 6, true);
    central +=
      46 +
      view.getUint16(central + 28, true) +
      view.getUint16(central + 30, true) +
      view.getUint16(central + 32, true);
    view.setUint32(central + 24, 70 * 1024 * 1024, true);
    const report = await inspectLocalBytes(bytes, { ...config(), captureCurrentImport: true });
    expect(report.candidate.currentImportBaseline.attempted).toBe(false);
    expect(report.candidate.currentImportBaseline.errorCode).toBe("CURRENT_IMPORT_LIMIT_CONFLICT");
  });

  it("never overwrites an original, copies raw packages, or extracts traversal-named attachments", async () => {
    const space = sandbox();
    try {
      const input = join(space.directory, "private-original.mmap");
      const bytes = zip(syntheticXml, { "../../escaped.bin": strToU8("never extract") });
      writeFileSync(input, bytes);
      const before = statSync(input).mtimeMs;
      const record = config(input);
      const result = await intakeFile(record, space.directory);
      expect(result.inspectionCompleted).toBe(true);
      expect(readFileSync(input)).toEqual(Buffer.from(bytes));
      expect(statSync(input).mtimeMs).toBe(before);
      expect(
        readdirSync(resolve(space.directory, result.outputDirectory)).some((file) =>
          file.endsWith(".mmap"),
        ),
      ).toBe(false);
      expect(readdirSync(space.directory).some((file) => file === "escaped.bin")).toBe(false);
      expect(await intakeFile(record, space.directory)).toEqual(result);
      writeFileSync(input, zip("<Map><Topic/></Map>"));
      await expect(intakeFile(record, space.directory)).rejects.toThrow(/OPAQUE_ID_ALREADY_USED/);
    } finally {
      space.close();
    }
  });

  it("rejects output/input collisions and oversized files before reading their payload", async () => {
    const space = sandbox();
    try {
      const directory = resolve(space.directory, ".tmp/mmap-corpus/real-private/REAL-997");
      mkdirSync(directory, { recursive: true });
      const input = resolve(directory, "inspection.private.json");
      writeFileSync(input, zip());
      const original = readFileSync(input);
      await expect(intakeFile(config(input), space.directory)).rejects.toThrow(
        /OUTSIDE_DERIVED_OUTPUT/,
      );
      expect(readFileSync(input)).toEqual(original);
      const oversized = join(space.directory, "oversized.mmap");
      writeFileSync(oversized, "");
      truncateSync(oversized, 64 * 1024 * 1024 + 1);
      await expect(intakeFile(config(oversized), space.directory)).rejects.toThrow(/INPUT_LIMIT/);
    } finally {
      space.close();
    }
  });

  it("runs status/error CLI paths and the opt-in current importer in a plain Node process", () => {
    const cli = (...args: string[]) =>
      spawnSync(
        process.execPath,
        ["--experimental-strip-types", resolve("tools/mmap-real-cli.ts"), ...args],
        { encoding: "utf8" },
      );
    expect(JSON.parse(cli("status").stdout).phase1Result).toBe(
      "BLOCKED ON REAL-CORPUS ACQUISITION",
    );
    expect(cli("status", "--format", "markdown").stdout).toBe(renderFeatureInventory());
    expect(cli("intake").status).toBe(2);
    expect(cli("intake", "tools/mmap-real/local-intake.example.json").status).toBe(1);
    const space = sandbox();
    try {
      const input = join(space.directory, "sensitive-test-name.mmap");
      writeFileSync(input, zip());
      const record = { ...config(input), captureCurrentImport: true };
      const configFile = join(space.directory, "private-config.json");
      writeFileSync(configFile, JSON.stringify(record));
      const runner = join(space.directory, "run.mjs");
      writeFileSync(
        runner,
        `import { readFileSync } from 'node:fs'; import { intakeFile, validateLocalConfig } from ${JSON.stringify(pathToFileURL(resolve("tools/mmap-real/intake.ts")).href)}; const config=validateLocalConfig(JSON.parse(readFileSync(process.argv[2],'utf8'))); const result=await intakeFile(config,process.argv[3]); process.stdout.write(JSON.stringify(result));`,
      );
      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", runner, configFile, space.directory],
        { encoding: "utf8" },
      );
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).not.toContain("sensitive-test-name");
      const candidate = JSON.parse(
        readFileSync(
          resolve(
            space.directory,
            ".tmp/mmap-corpus/real-private/REAL-997/sanitized-structure.candidate.json",
          ),
          "utf8",
        ),
      );
      expect(candidate.currentImportBaseline.importsSuccessfully).toBe(true);
      expect(candidate.currentImportBaseline.counts.topics).toBe(1);
      expect(candidate.currentImportBaseline.counts.summary).toBeNull();
      expect(readFileSync(input)).toEqual(Buffer.from(zip()));
    } finally {
      space.close();
    }
  });
});
