// Mindloom synthetic inspection corpus builder. Does not use the production
// MMAP writer, canonical model, an Oracle, customer files or network access.
import { readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { strToU8, zipSync, zlibSync } from "fflate";

interface Resource {
  path: string;
  recipe: "rgba-1x1-v1";
}
interface Expected {
  packageEntries: string[];
  namespaceUris: string[];
  topicIds: string[];
  elements: Record<string, number>;
  attributes: Record<string, number>;
  paths: Record<string, number>;
  unrecognizedElements: string[];
  unrecognizedAttributes: string[];
  resourceUris: string[];
  relationshipRefs: string[];
}
interface FixtureBase {
  id: string;
  feature: string;
  provenance: "synthetic";
  generator: string;
  sourceEvidence: string[];
  limitations: string[];
}
export interface GeneratedFixture extends FixtureBase {
  status: "generated";
  definition: string;
  resources: Resource[];
  expected: Expected;
}
interface PendingFixture extends FixtureBase {
  status: "pending-format-evidence";
  definition: null;
  resources: [];
  expected: null;
}
export interface CorpusManifest {
  schemaVersion: 1;
  corpus: "mindloom-phase1-synthetic";
  claims: Record<string, false>;
  fixtures: (GeneratedFixture | PendingFixture)[];
}

export const CORPUS_ROOT = fileURLToPath(
  new URL("../../test/fixtures/mmap-corpus/synthetic/", import.meta.url),
);
const GENERATOR = "tools/mmap-corpus/builder.ts#fixed-zip32-v1";
const CLAIMS = [
  "mindManagerGenerated",
  "oracleVerified",
  "roundTripSafe",
  "schemaValidated",
  "compatibilityEstablished",
  "writerGenerated",
];
function fail(message: string): never {
  throw new Error(`Synthetic corpus: ${message}`);
}
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fail("expected an object.");
  return value as Record<string, unknown>;
};
function strings(value: unknown, nonempty = false): string[] {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || !item) ||
    (nonempty && !value.length)
  )
    return fail("expected a string list.");
  return value as string[];
}
function counts(value: unknown): void {
  if (
    !Object.entries(object(value)).every(
      ([key, count]) =>
        key && Number.isInteger(count) && (count as number) > 0 && (count as number) <= 1000,
    )
  )
    fail("invalid expected structural counts.");
}
function resourcePath(path: unknown): asserts path is string {
  if (typeof path !== "string" || !/^bin\/[a-z0-9-]+\.png$/.test(path))
    fail("unsafe resource entry path.");
}

/** Validate provenance, expected-evidence shape and the generated/pending distinction. */
export function validateManifest(value: unknown): CorpusManifest {
  const manifest = object(value);
  if (manifest.schemaVersion !== 1 || manifest.corpus !== "mindloom-phase1-synthetic")
    fail("unsupported manifest identity.");
  const claims = object(manifest.claims);
  if (Object.keys(claims).length !== CLAIMS.length || CLAIMS.some((key) => claims[key] !== false))
    fail("synthetic fixtures cannot assert compatibility or Oracle claims.");
  if (!Array.isArray(manifest.fixtures) || manifest.fixtures.length !== 14)
    fail("all 14 corpus slots are required.");
  const ids = new Set<string>();
  manifest.fixtures.forEach((entry, index) => {
    const fixture = object(entry);
    if (
      typeof fixture.feature !== "string" ||
      !/^[a-z]+(?:-[a-z]+)*$/.test(fixture.feature) ||
      fixture.id !== `${String(index + 1).padStart(2, "0")}-${fixture.feature}` ||
      ids.has(fixture.id as string)
    )
      fail("invalid, duplicate or out-of-order fixture ID.");
    ids.add(fixture.id as string);
    if (fixture.provenance !== "synthetic" || fixture.generator !== GENERATOR)
      fail("explicit synthetic provenance/generator is required.");
    if (
      strings(fixture.sourceEvidence, true).some(
        (source) =>
          !/^(src|test|tools|docs)\/[a-zA-Z0-9_./-]+#[a-zA-Z0-9_-]+$/.test(source) ||
          source.split("/").includes(".."),
      )
    )
      fail("source evidence must use repository-relative paths and locators.");
    strings(fixture.limitations, true);
    if (!Array.isArray(fixture.resources) || fixture.resources.length > 4)
      fail("small resource list required.");
    const resourcePaths = new Set<string>();
    for (const entry of fixture.resources) {
      const resource = object(entry);
      resourcePath(resource.path);
      if (resource.recipe !== "rgba-1x1-v1" || resourcePaths.has(resource.path))
        fail("unknown or duplicate synthetic resource recipe.");
      resourcePaths.add(resource.path);
    }
    if (fixture.status === "pending-format-evidence") {
      if (fixture.definition !== null || fixture.expected !== null || fixture.resources.length)
        fail("pending fixtures must not have payloads or expected generated evidence.");
    } else if (fixture.status === "generated") {
      if (fixture.definition !== `documents/${fixture.id}.xml`)
        fail("generated fixture must have its own safe XML definition.");
      const expected = object(fixture.expected);
      for (const field of [
        "packageEntries",
        "namespaceUris",
        "topicIds",
        "unrecognizedElements",
        "unrecognizedAttributes",
        "resourceUris",
        "relationshipRefs",
      ])
        strings(expected[field]);
      for (const field of ["elements", "attributes", "paths"]) counts(expected[field]);
    } else fail("unknown fixture status.");
  });
  return manifest as unknown as CorpusManifest;
}

export function readManifest(): CorpusManifest {
  return validateManifest(JSON.parse(readFileSync(resolve(CORPUS_ROOT, "manifest.json"), "utf8")));
}

/** Read a reviewed definition only from the source corpus, including symlink checks. */
export function readDefinition(fixture: GeneratedFixture): Uint8Array {
  if (fixture.definition !== `documents/${fixture.id}.xml`) return fail("unsafe definition path.");
  const path = realpathSync(resolve(CORPUS_ROOT, fixture.definition));
  const within = relative(realpathSync(CORPUS_ROOT), path);
  if (
    isAbsolute(within) ||
    within === ".." ||
    within.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)
  )
    return fail("definition escaped corpus source directory.");
  return readFileSync(path);
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length + 12);
  const view = new DataView(result.buffer);
  view.setUint32(0, data.length);
  result.set(strToU8(type), 4);
  result.set(data, 8);
  view.setUint32(data.length + 8, crc32(result.subarray(4, data.length + 8)));
  return result;
}

/** Project-created 1x1 opaque blue RGBA pixel; no external/proprietary asset. */
export function syntheticPixelPng(): Uint8Array {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, 1);
  view.setUint32(4, 1);
  header[8] = 8;
  header[9] = 6; // 8-bit RGBA
  const pieces = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlibSync(new Uint8Array([0, 41, 128, 255, 255]), { level: 6 })),
    chunk("IEND", new Uint8Array()),
  ];
  const result = new Uint8Array(pieces.reduce((length, piece) => length + piece.length, 0));
  let offset = 0;
  for (const piece of pieces) {
    result.set(piece, offset);
    offset += piece.length;
  }
  return result;
}

/** Deterministic test packaging only — not the application writer or a round-trip engine. */
export function buildFixture(
  fixture: GeneratedFixture | PendingFixture,
  documentXml?: Uint8Array,
): Uint8Array {
  if (fixture.status !== "generated")
    return fail(`${fixture.id} is pending format evidence; no package can be generated.`);
  const xmlBytes = documentXml ?? readDefinition(fixture);
  if (xmlBytes.length > 32 * 1024) return fail("XML fixture exceeds the 32 KiB source limit.");
  const xml = new TextDecoder("utf-8", { fatal: true })
    .decode(xmlBytes)
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n");
  if (xml.includes("<!DOCTYPE") || xml.includes("<!ENTITY"))
    return fail("DTD/entity declarations are not permitted in synthetic definitions.");
  const entries: Record<string, Uint8Array> = { "Document.xml": strToU8(xml) };
  if (fixture.resources.length > 4) return fail("too many synthetic resource entries.");
  for (const resource of fixture.resources) {
    resourcePath(resource.path);
    if (resource.recipe !== "rgba-1x1-v1" || Object.hasOwn(entries, resource.path))
      return fail("invalid or duplicate resource.");
    entries[resource.path] = syntheticPixelPng();
  }
  const sorted = Object.fromEntries(
    Object.entries(entries).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  // fflate encodes DOS LOCAL wall-clock fields. A UTC instant would differ by TZ;
  // constructing the same fixed local wall clock produces identical archive bytes.
  return zipSync(sorted, { level: 6, mtime: new Date(1980, 0, 1, 0, 0, 0) });
}

export const WORKSPACE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
