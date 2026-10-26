// Local-only inspection. No package copying, extraction, writer or publication.
import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { unzipSync } from "fflate";
import { type MmapInspection, inspectMmap } from "../../src/formats/mmap/inspector.ts";
import { normalizeMmap } from "../../src/formats/mmap/normalize.ts";
import {
  MAX_DOCUMENT_BYTES,
  MAX_PACKAGE_BYTES,
  checkZipDirectory,
} from "../../src/formats/mmap/zip-directory.ts";
import { PROVENANCE, opaqueId } from "./manifest.ts";

export interface LocalConfig {
  schemaVersion: 1;
  id: string;
  inputPath: string;
  provenanceClass: (typeof PROVENANCE)[number];
  producer: "MindManager" | null;
  producerVersion: string | null;
  platform: "Windows" | "macOS" | null;
  contentSynthetic: boolean | null;
  sanitized: boolean;
  localInspectionAllowed: true;
  permissionEvidence: string;
  captureCurrentImport: boolean;
}
function reject(code: string): never {
  throw new Error(code);
}
export function validateLocalConfig(value: unknown): LocalConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) reject("INVALID_LOCAL_CONFIG");
  const config = value as Record<string, unknown>;
  opaqueId(config.id);
  if (
    config.schemaVersion !== 1 ||
    typeof config.inputPath !== "string" ||
    !config.inputPath ||
    !PROVENANCE.includes(config.provenanceClass as LocalConfig["provenanceClass"])
  )
    reject("INVALID_LOCAL_CONFIG");
  if (
    config.localInspectionAllowed !== true ||
    typeof config.permissionEvidence !== "string" ||
    !config.permissionEvidence.trim()
  )
    reject("LOCAL_PERMISSION_REQUIRED");
  if (config.producer !== null && config.producer !== "MindManager")
    reject("UNSUPPORTED_PRODUCER_DECLARATION");
  if (
    config.producerVersion !== null &&
    (typeof config.producerVersion !== "string" ||
      !/^\d+(\.\d+){0,4}$/.test(config.producerVersion))
  )
    reject("INVALID_VERSION_DECLARATION");
  if (config.platform !== null && config.platform !== "Windows" && config.platform !== "macOS")
    reject("INVALID_PLATFORM_DECLARATION");
  if (
    typeof config.sanitized !== "boolean" ||
    typeof config.captureCurrentImport !== "boolean" ||
    (config.contentSynthetic !== null && typeof config.contentSynthetic !== "boolean")
  )
    reject("INVALID_LOCAL_CONFIG");
  if (
    config.provenanceClass === "mindmanager-generated-synthetic-content" &&
    config.contentSynthetic !== true
  )
    reject("CONTENT_PROVENANCE_REQUIRED");
  if (config.provenanceClass === "sanitized-real-world" && !config.sanitized)
    reject("SANITIZATION_PROCEDURE_REQUIRED");
  return config as unknown as LocalConfig;
}
const fingerprint = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
const sorted = <T>(map: Map<string, T>): T[] =>
  [...map.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([, value]) => value);
function counts(values: { name: string; count: number }[]): { name: string; count: number }[] {
  const map = new Map<string, { name: string; count: number }>();
  for (const { name, count } of values) {
    const previous = map.get(name);
    if (previous) previous.count += count;
    else map.set(name, { name, count });
  }
  return sorted(map);
}
// Privacy allowlist only. This does not add namespace/feature recognition.
const publicNamespaces = new Set([
  "http://schemas.mindjet.com/MindManager/Application/2003",
  "http://schemas.mindjet.com/MindManager/Core/2003",
  "http://schemas.mindjet.com/MindManager/Primitive/2003",
  "http://www.w3.org/1999/xhtml",
  "http://www.w3.org/2001/XMLSchema-instance",
  "http://www.w3.org/XML/1998/namespace",
]);

/** Candidate evidence only. Raw paths/prefixes/unknown names/CRCs/hashes never enter the shape. */
export function sanitizedStructure(report: MmapInspection) {
  const inventory = report.document.inventory;
  const knownNames = new Set(
    (inventory?.elements ?? [])
      .filter((entry) => entry.recognition === "known" && publicNamespaces.has(entry.namespaceUri))
      .map((entry) => `{${entry.namespaceUri}}${entry.localName}`),
  );
  const safeName = (uri: string, local: string) =>
    knownNames.has(`{${uri}}${local}`) ? `{${uri}}${local}` : "[unrecognized]";
  const elements: { name: string; count: number }[] = [];
  const attributes: { name: string; count: number }[] = [];
  const paths: { name: string; count: number }[] = [];
  for (const entry of inventory?.elements ?? [])
    elements.push({
      name: `${entry.recognition}:${safeName(entry.namespaceUri, entry.localName)}`,
      count: entry.count,
    });
  for (const entry of inventory?.attributes ?? []) {
    const name =
      entry.recognition === "known" &&
      (entry.namespaceUri === "" || publicNamespaces.has(entry.namespaceUri))
        ? `{${entry.namespaceUri}}${entry.localName}`
        : "[unrecognized]";
    attributes.push({
      name: `${safeName(entry.owner.namespaceUri, entry.owner.localName)}@${name}`,
      count: entry.count,
    });
  }
  for (const entry of inventory?.paths ?? []) {
    const path = JSON.stringify(
      entry.expandedPath.map((name) => (knownNames.has(name) ? name : "[unrecognized]")),
    );
    paths.push({ name: path, count: entry.count });
  }
  return {
    inspectionCompleted: report.valid,
    issueCodes: report.issues.map((issue) => issue.code).sort(),
    package: {
      entryCount: report.package.entryCount,
      entryClasses: counts(
        report.package.entries.map((entry) => ({ name: entry.category, count: 1 })),
      ),
      documentLocation: !report.document.present
        ? "missing"
        : !report.document.path
          ? "ambiguous"
          : report.document.path.includes("/")
            ? "nested"
            : "root",
      previewPresent: report.preview.present,
      binEntries: report.resources.bin.length,
      xsdEntries: report.resources.xsd.length,
      unrecognizedEntries: report.unknown.entries.length,
      compressionMethods: [
        ...new Set(report.package.entries.map((entry) => entry.compressionMethod)),
      ].sort((a, b) => a - b),
    },
    xml: {
      root: inventory ? safeName(inventory.root.namespaceUri, inventory.root.localName) : null,
      namespaces: counts(
        (inventory?.namespaces ?? []).map((entry) => ({
          name: publicNamespaces.has(entry.uri) ? entry.uri : "[unrecognized]",
          count: entry.count,
        })),
      ),
      elements: counts(elements),
      attributes: counts(attributes),
      paths: counts(paths),
    },
  };
}

function preflight(bytes: Uint8Array): void {
  checkZipDirectory(bytes);
  const documents: { name: string; size: number }[] = [];
  unzipSync(bytes, {
    filter: (entry) => {
      if (entry.name.split("/").at(-1)?.toLowerCase() === "document.xml")
        documents.push({ name: entry.name, size: entry.originalSize });
      return false;
    },
  });
  if (documents.some((entry) => entry.size > MAX_DOCUMENT_BYTES)) reject("DOCUMENT_LIMIT_CONFLICT");
  if (documents.length !== 1) return; // inspector will report missing/ambiguous
  const data = unzipSync(bytes, { filter: (entry) => entry.name === documents[0].name })[
    documents[0].name
  ];
  const encoding =
    (data[0] === 0xff && data[1] === 0xfe) || (data[0] === 0x3c && data[1] === 0)
      ? "utf-16le"
      : (data[0] === 0xfe && data[1] === 0xff) || (data[0] === 0 && data[1] === 0x3c)
        ? "utf-16be"
        : "utf-8";
  const xml = new TextDecoder(encoding, { fatal: true }).decode(data);
  // Conservative token rejection (also inside comments), not a regex XML parser.
  if (xml.includes("<!DOCTYPE") || xml.includes("<!ENTITY")) reject("DTD_ENTITY_REJECTED");
}
interface Baseline {
  attempted: boolean;
  importsSuccessfully: boolean | null;
  counts: Record<string, number | null> | null;
  warningCount: number | null;
  errorCode: string | null;
}
async function currentImport(bytes: Uint8Array, report: MmapInspection): Promise<Baseline> {
  const total = report.package.entries.reduce((sum, entry) => sum + entry.uncompressedSize, 0);
  if (
    !report.valid ||
    total > MAX_PACKAGE_BYTES ||
    report.package.entries.some(
      (entry) =>
        entry.uncompressedSize > MAX_DOCUMENT_BYTES || ![0, 8].includes(entry.compressionMethod),
    )
  )
    return {
      attempted: false,
      importsSuccessfully: null,
      counts: null,
      warningCount: null,
      errorCode: "CURRENT_IMPORT_LIMIT_CONFLICT",
    };
  try {
    const { register } = await import("node:module");
    register(new URL("./legacy-ts-resolver.mjs", import.meta.url));
    const { parseMmap } = await import("../../src/import/mmap.ts");
    const { doc, warnings } = parseMmap(bytes);
    const nodes = [doc.root, ...(doc.floatingTopics ?? [])];
    const result: Record<string, number | null> = {
      topics: 0,
      notes: 0,
      links: 0,
      markers: 0,
      tags: 0,
      tasks: 0,
      images: 0,
      attachments: 0,
      callouts: 0,
      styles: 0,
      relationships: doc.links?.length ?? 0,
      boundaries: doc.boundaries?.length ?? 0,
      floatingTopics: doc.floatingTopics?.length ?? 0,
      summary: null,
    };
    while (nodes.length) {
      const node = nodes.pop();
      if (!node) break;
      result.topics = (result.topics ?? 0) + 1;
      for (const key of ["notes", "links", "tasks", "images", "styles"] as const) {
        const has =
          key === "notes"
            ? node.note
            : key === "links"
              ? node.hyperlink
              : key === "tasks"
                ? node.task
                : key === "images"
                  ? node.image
                  : node.style;
        if (has) result[key] = (result[key] ?? 0) + 1;
      }
      result.markers = (result.markers ?? 0) + (node.icons?.length ?? 0);
      result.tags = (result.tags ?? 0) + (node.tags?.length ?? 0);
      result.attachments = (result.attachments ?? 0) + (node.attachments?.length ?? 0);
      result.callouts = (result.callouts ?? 0) + (node.callouts?.length ?? 0);
      nodes.push(...node.children);
    }
    return {
      attempted: true,
      importsSuccessfully: true,
      counts: result,
      warningCount: warnings.length,
      errorCode: null,
    };
  } catch {
    return {
      attempted: true,
      importsSuccessfully: false,
      counts: null,
      warningCount: null,
      errorCode: "CURRENT_IMPORT_FAILED",
    };
  }
}

/** Safe for future local inputs; a successful intake is NOT proof of genuine provenance. */
export async function inspectLocalBytes(bytes: Uint8Array, config: LocalConfig) {
  validateLocalConfig(config);
  preflight(bytes);
  const inspection = inspectMmap(bytes); // no original filename in the report
  const normalized = normalizeMmap(inspection);
  const shape = sanitizedStructure(inspection);
  const baseline: Baseline = config.captureCurrentImport
    ? await currentImport(bytes, inspection)
    : {
        attempted: false,
        importsSuccessfully: null,
        counts: null,
        warningCount: null,
        errorCode: "NOT_REQUESTED",
      };
  return {
    inspection,
    normalized,
    packageSha256: fingerprint(bytes),
    normalizedFingerprint: fingerprint(normalized),
    candidate: {
      schemaVersion: 1,
      id: config.id,
      provenanceClass: config.provenanceClass,
      provenanceVerification: "operator-declared-not-independently-verified",
      producer: config.producer,
      producerVersion: config.producerVersion,
      platform: config.platform,
      publicationStatus: "candidate-requires-human-review",
      publicCommitAllowed: false,
      rawCommitted: false,
      oracleVerified: false,
      roundTripSafe: false,
      shape,
      sanitizedStructuralFingerprint: fingerprint(JSON.stringify(shape)),
      currentImportBaseline: baseline,
    },
  };
}

/** Fixed private output tree, no symlink traversal; no input or embedded payload is written. */
export async function intakeFile(config: LocalConfig, workspaceRoot: string) {
  validateLocalConfig(config);
  const input = realpathSync(config.inputPath);
  const stat = statSync(input);
  if (!stat.isFile() || stat.size > MAX_PACKAGE_BYTES) reject("INPUT_LIMIT_OR_TYPE_CONFLICT");
  const actualWorkspace = realpathSync(workspaceRoot);
  const output = resolve(actualWorkspace, ".tmp/mmap-corpus/real-private", config.id);
  const within = relative(output, input);
  if (
    !isAbsolute(within) &&
    within !== ".." &&
    !within.startsWith("../") &&
    !within.startsWith("..\\")
  )
    reject("INPUT_MUST_BE_OUTSIDE_DERIVED_OUTPUT");
  const bytes = readFileSync(input);
  const result = await inspectLocalBytes(bytes, config);
  let directory = actualWorkspace;
  for (const segment of [".tmp", "mmap-corpus", "real-private", config.id]) {
    directory = resolve(directory, segment);
    if (!lstatSync(directory, { throwIfNoEntry: false })) mkdirSync(directory);
    const entry = lstatSync(directory);
    if (entry.isSymbolicLink() || !entry.isDirectory()) reject("UNSAFE_PRIVATE_OUTPUT_DIRECTORY");
  }
  const hashFile = resolve(directory, "package-sha256.private.txt");
  const existing = lstatSync(hashFile, { throwIfNoEntry: false });
  if (
    existing &&
    (existing.isSymbolicLink() ||
      !existing.isFile() ||
      readFileSync(hashFile, "utf8").trim() !== result.packageSha256)
  )
    reject("OPAQUE_ID_ALREADY_USED_OR_UNSAFE");
  const write = (name: string, value: string) => {
    const path = resolve(directory, name);
    const entry = lstatSync(path, { throwIfNoEntry: false });
    if (entry && (entry.isSymbolicLink() || !entry.isFile() || entry.nlink > 1))
      reject("UNSAFE_PRIVATE_OUTPUT_FILE");
    writeFileSync(path, value);
  };
  write("inspection.private.json", `${JSON.stringify(result.inspection, null, 2)}\n`);
  write("normalized.private.json", result.normalized);
  write("package-sha256.private.txt", `${result.packageSha256}\n`);
  write("permission.private.json", `${JSON.stringify(config, null, 2)}\n`);
  write("sanitized-structure.candidate.json", `${JSON.stringify(result.candidate, null, 2)}\n`);
  if (fingerprint(readFileSync(input)) !== result.packageSha256)
    reject("ORIGINAL_CHANGED_DURING_INSPECTION");
  return {
    id: config.id,
    inspectionCompleted: result.inspection.valid,
    publicationStatus: result.candidate.publicationStatus,
    outputDirectory: `.tmp/mmap-corpus/real-private/${config.id}`,
  };
}
