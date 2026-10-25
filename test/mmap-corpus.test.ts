// Synthetic inspection infrastructure only. No live MindManager, network or customer files.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { crc32, inflateSync } from "node:zlib";
import { XMLParser } from "fast-xml-parser";
import { strFromU8, strToU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { inspectMmap } from "../src/formats/mmap/inspector";
import { normalizeMmap } from "../src/formats/mmap/normalize";
import { parseMmap } from "../src/import/mmap";
import { toMmap } from "../src/io/mmap";
import {
  CORPUS_ROOT,
  type GeneratedFixture,
  WORKSPACE_ROOT,
  buildFixture,
  readDefinition,
  readManifest,
  syntheticPixelPng,
  validateManifest,
} from "../tools/mmap-corpus/builder";

const manifest = readManifest();
const generated = manifest.fixtures.filter(
  (fixture): fixture is GeneratedFixture => fixture.status === "generated",
);
const payload = (fixture: GeneratedFixture) => buildFixture(fixture);
const sourceXml = (fixture: GeneratedFixture) => strFromU8(readDefinition(fixture));
const fixtureById = (id: string) => {
  const fixture = generated.find((fixture) => fixture.id === id);
  if (!fixture) throw new Error(`No materialized fixture ${id}`);
  return fixture;
};
function counted<T>(
  values: T[],
  key: (value: T) => string,
  count: (value: T) => number,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const value of values) result[key(value)] = (result[key(value)] ?? 0) + count(value);
  return result;
}
interface XmlRecord {
  name: string;
  path: string;
  attributes: Record<string, string>;
  text: string;
}
function records(xml: string): XmlRecord[] {
  const nodes = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    removeNSPrefix: false,
    parseTagValue: false,
  }).parse(xml) as Record<string, unknown>[];
  const result: XmlRecord[] = [];
  function walk(nodes: Record<string, unknown>[], path: string) {
    for (const node of nodes) {
      const name = Object.keys(node).find((key) => key !== ":@");
      if (!name || name.startsWith("?") || name.startsWith("#")) continue;
      const children = node[name] as Record<string, unknown>[];
      const attributes = Object.fromEntries(
        Object.entries((node[":@"] ?? {}) as Record<string, string>).map(([key, value]) => [
          key.slice(2),
          value,
        ]),
      );
      const childPath = `${path}/${name}`;
      result.push({
        name,
        path: childPath,
        attributes,
        text: children.map((child) => child["#text"] ?? "").join(""),
      });
      walk(children, childPath);
    }
  }
  walk(nodes, "");
  return result;
}

describe("Mindloom Phase 1 Batch 2 synthetic corpus", () => {
  it("has exactly the 14 requested slots, explicit provenance and evidence-backed sources", () => {
    expect(manifest.fixtures.map((fixture) => fixture.id)).toEqual([
      "01-root-only",
      "02-three-level-tree",
      "03-notes",
      "04-links",
      "05-icons",
      "06-tags",
      "07-task",
      "08-image",
      "09-relationship",
      "10-boundary",
      "11-callout",
      "12-floating",
      "13-summary",
      "14-mixed",
    ]);
    expect(generated).toHaveLength(13);
    expect(Object.values(manifest.claims).every((value) => value === false)).toBe(true);
    for (const fixture of manifest.fixtures) {
      expect(fixture.provenance).toBe("synthetic");
      expect(fixture.generator).toBe("tools/mmap-corpus/builder.ts#fixed-zip32-v1");
      expect(fixture.limitations.length).toBeGreaterThan(0);
      for (const source of fixture.sourceEvidence)
        expect(existsSync(resolve(WORKSPACE_ROOT, source.split("#")[0])), source).toBe(true);
      if (fixture.status === "generated")
        expect(existsSync(resolve(CORPUS_ROOT, fixture.definition))).toBe(true);
    }
  });

  it.each(generated)("$id agrees with curated package/XML/normalization facts", (fixture) => {
    const bytes = payload(fixture);
    const report = inspectMmap(bytes, `${fixture.id}.mmap`);
    const normalized = JSON.parse(normalizeMmap(report));
    expect(report.valid, JSON.stringify(report.issues)).toBe(true);
    expect(normalized.package.entries.map((entry: { path: string }) => entry.path)).toEqual(
      fixture.expected.packageEntries,
    );
    expect(report.resources.bin).toEqual(fixture.resources.map((resource) => resource.path));
    expect(report.unknown.entries).toEqual([]);
    const inventory = report.document.inventory;
    if (!inventory) throw new Error("Expected XML inventory");
    expect([...new Set(inventory.namespaces.map((ns) => ns.uri))].sort()).toEqual(
      fixture.expected.namespaceUris,
    );
    expect(inventory.namespaces).toHaveLength(fixture.expected.namespaceUris.length);
    expect(
      counted(
        inventory.elements,
        (entry) => entry.qualifiedName,
        (entry) => entry.count,
      ),
    ).toEqual(fixture.expected.elements);
    expect(
      counted(
        inventory.attributes,
        (entry) => `${entry.owner.qualifiedName}@${entry.qualifiedName}`,
        (entry) => entry.count,
      ),
    ).toEqual(fixture.expected.attributes);
    for (const [path, count] of Object.entries(fixture.expected.paths))
      expect(inventory.paths.find((entry) => entry.path === path)?.count, path).toBe(count);
    expect(report.unknown.elements.map((entry) => entry.qualifiedName).sort()).toEqual(
      fixture.expected.unrecognizedElements,
    );
    expect(report.unknown.attributes.map((entry) => entry.qualifiedName).sort()).toEqual(
      fixture.expected.unrecognizedAttributes,
    );
    expect(
      inventory.elements
        .filter((entry) => entry.recognition === "known")
        .map((entry) => entry.qualifiedName)
        .sort(),
    ).toEqual(
      Object.keys(fixture.expected.elements)
        .filter((name) => !fixture.expected.unrecognizedElements.includes(name))
        .sort(),
    );
    expect(normalized.unknown.elements).toEqual(report.unknown.elements);
    expect(normalized).not.toHaveProperty("inputFile");
    expect(bytes.length).toBeLessThan(4096);
  });

  it("regenerates every package byte-identically and normalizes identically without mutating source", () => {
    for (const fixture of generated) {
      const source = readDefinition(fixture);
      const first = buildFixture(fixture, source);
      const second = buildFixture(fixture, source);
      expect(first, fixture.id).toEqual(second);
      expect(normalizeMmap(inspectMmap(first, "first.mmap"))).toBe(
        normalizeMmap(inspectMmap(second, "second.mmap")),
      );
      expect(source).toEqual(readDefinition(fixture));
      expect(buildFixture(fixture, strToU8(sourceXml(fixture).replaceAll("\n", "\r\n")))).toEqual(
        first,
      );
    }
  });

  it("isolates each small feature using exact element/attribute baselines and bounded resources", () => {
    const oneTopicCases = [
      "01-root-only",
      "03-notes",
      "04-links",
      "05-icons",
      "06-tags",
      "07-task",
      "08-image",
      "10-boundary",
    ];
    for (const id of oneTopicCases) {
      const fixture = fixtureById(id);
      const nodes = records(sourceXml(fixture));
      expect(nodes.filter((node) => node.name === "ap:Topic")).toHaveLength(1);
      expect(nodes.filter((node) => node.name === "ap:Text")[0].attributes.PlainText).toBe(
        "Synthetic root",
      );
      expect(fixture.resources).toHaveLength(id === "08-image" ? 1 : 0);
    }
    const root = records(sourceXml(fixtureById("01-root-only")));
    expect(root.map((node) => node.name)).toEqual(["ap:Map", "ap:OneTopic", "ap:Topic", "ap:Text"]);
    const tree = records(sourceXml(fixtureById("02-three-level-tree"))).filter(
      (node) => node.name === "ap:Topic",
    );
    expect(tree.map((node) => node.path)).toEqual([
      "/ap:Map/ap:OneTopic/ap:Topic",
      "/ap:Map/ap:OneTopic/ap:Topic/ap:SubTopics/ap:Topic",
      "/ap:Map/ap:OneTopic/ap:Topic/ap:SubTopics/ap:Topic/ap:SubTopics/ap:Topic",
    ]);
  });

  it("uses documented synthetic marker, link, tag, task and image values", () => {
    const attribute = (id: string, name: string) =>
      records(sourceXml(fixtureById(id))).find((record) => record.name === name)?.attributes;
    expect(attribute("04-links", "ap:Hyperlink")).toEqual({
      Url: "https://example.invalid/mindloom-fixture",
    });
    expect(attribute("05-icons", "ap:Icon")).toEqual({ IconType: "urn:mindjet:Flag" });
    expect(attribute("06-tags", "ap:TextLabel")).toEqual({ TextLabelName: "synthetic-tag" });
    expect(attribute("07-task", "ap:Task")).toEqual({
      TaskPriority: "urn:mindjet:Prio3",
      TaskPercentage: "25",
      StartDate: "2026-01-12T00:00:00",
      DeadlineDate: "2026-01-14T00:00:00",
      Resources: "Synthetic Person",
    });
    expect(attribute("08-image", "ap:ImageData")).toEqual({ ImageType: "urn:mindjet:PngImage" });
    expect(attribute("08-image", "ap:ImageSize")).toEqual({ Width: "1", Height: "1" });
  });

  it("resolves every image URI and relationship reference against its own package/topic IDs", () => {
    for (const fixture of generated) {
      const entries = unzipSync(payload(fixture));
      const nodes = records(strFromU8(entries["Document.xml"]));
      const ids = nodes
        .filter((node) => node.name === "ap:Topic")
        .map((node) => node.attributes.OId);
      expect([...ids].sort()).toEqual([...fixture.expected.topicIds].sort());
      expect(new Set(ids).size).toBe(ids.length);
      const refs = nodes
        .filter((node) => node.name === "ap:ObjectReference")
        .map((node) => node.attributes.OIdRef);
      expect(refs).toEqual(fixture.expected.relationshipRefs);
      for (const reference of refs) expect(ids).toContain(reference);
      const uris = nodes.filter((node) => node.name === "cor:Uri").map((node) => node.text);
      expect(uris).toEqual(fixture.expected.resourceUris);
      for (const uri of uris) expect(entries[uri.slice("mmarch://".length)]).toBeDefined();
      expect(uris.map((uri) => uri.slice("mmarch://".length)).sort()).toEqual(
        Object.keys(entries)
          .filter((path) => path !== "Document.xml")
          .sort(),
      );
      expect(
        Object.keys(entries)
          .filter((path) => path !== "Document.xml")
          .sort(),
      ).toEqual(fixture.resources.map((resource) => resource.path));
    }
  });

  it("creates a small valid PNG with independently verified CRCs and known RGBA bytes", () => {
    const png = syntheticPixelPng();
    expect(png).toEqual(syntheticPixelPng());
    expect(png.slice(0, 8)).toEqual(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(png.length).toBeLessThan(100);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    const types: string[] = [];
    let offset = 8;
    while (offset < png.length) {
      const length = view.getUint32(offset);
      const type = strFromU8(png.subarray(offset + 4, offset + 8));
      types.push(type);
      expect(view.getUint32(offset + 8 + length)).toBe(
        crc32(png.subarray(offset + 4, offset + 8 + length)),
      );
      if (type === "IHDR") {
        expect(view.getUint32(offset + 8)).toBe(1);
        expect(view.getUint32(offset + 12)).toBe(1);
      }
      if (type === "IDAT")
        expect(new Uint8Array(inflateSync(png.subarray(offset + 8, offset + 8 + length)))).toEqual(
          new Uint8Array([0, 41, 128, 255, 255]),
        );
      offset += length + 12;
    }
    expect(types).toEqual(["IHDR", "IDAT", "IEND"]);
    expect(offset).toBe(png.length);
  });

  it("keeps the XHTML unknown wrapper visible and exposes existing callout write loss", () => {
    const note = inspectMmap(payload(fixtureById("03-notes")));
    expect(note.valid).toBe(true); // unknown does not mean invalid
    expect(note.unknown.elements).toMatchObject([
      {
        qualifiedName: "b",
        namespaceUri: "http://www.w3.org/1999/xhtml",
        recognition: "unrecognized",
      },
    ]);
    const callout = parseMmap(payload(fixtureById("11-callout"))).doc;
    expect(callout.root.callouts?.map((callout) => callout.text)).toEqual(["Synthetic callout"]);
    const writtenXml = strFromU8(unzipSync(toMmap(callout))["Document.xml"]);
    expect(writtenXml).not.toContain("CalloutFloatingTopicShape");
    expect(fixtureById("11-callout").limitations.join(" ")).toContain("writer omits");
  });

  it("retains summary as pending without inventing a payload or generated baseline", () => {
    const summary = manifest.fixtures.find((fixture) => fixture.id === "13-summary");
    if (!summary) throw new Error("Missing summary slot");
    expect(summary.status).toBe("pending-format-evidence");
    expect(summary.definition).toBeNull();
    expect(summary.expected).toBeNull();
    expect(summary.resources).toEqual([]);
    expect(() => buildFixture(summary)).toThrow(/pending format evidence/);
    expect(readdirSync(resolve(CORPUS_ROOT, "documents"))).not.toContain("13-summary.xml");
    const misleading = structuredClone(manifest);
    const altered = misleading.fixtures[12] as unknown as Record<string, unknown>;
    altered.status = "generated";
    expect(() => validateManifest(misleading)).toThrow(/safe XML definition/);
  });

  it("rejects false provenance/compatibility claims and never embeds machine-specific paths", () => {
    const bad = structuredClone(manifest) as unknown as { claims: Record<string, boolean> };
    bad.claims.oracleVerified = true;
    expect(() => validateManifest(bad)).toThrow(/compatibility or Oracle claims/);
    const wrongOrigin = structuredClone(manifest);
    (wrongOrigin.fixtures[0] as unknown as Record<string, unknown>).provenance =
      "MindManager-generated";
    expect(() => validateManifest(wrongOrigin)).toThrow(/synthetic provenance/);
    for (const value of [JSON.stringify(manifest), ...generated.map(sourceXml)]) {
      expect(value).not.toMatch(/\b[A-Za-z]:[\\/]|file:\/\/|\/Users\/|\/home\//);
    }
  });

  it("rejects traversal, external-entity sources and oversized definitions before packaging", () => {
    const baseline = fixtureById("01-root-only");
    for (const path of [
      "../escape.png",
      "bin/../../escape.png",
      "C:/escape.png",
      "/tmp/escape.png",
      "bin\\escape.png",
    ]) {
      const fixture = { ...baseline, resources: [{ path, recipe: "rgba-1x1-v1" as const }] };
      expect(() => buildFixture(fixture)).toThrow(/unsafe resource entry/);
    }
    expect(() => buildFixture({ ...baseline, definition: "../outside.xml" })).toThrow(
      /unsafe definition/,
    );
    expect(() => buildFixture(baseline, new Uint8Array(32 * 1024 + 1))).toThrow(/32 KiB/);
    expect(() =>
      buildFixture(
        baseline,
        strToU8(
          '<!DOCTYPE Map [<!ENTITY external SYSTEM "https://example.invalid/never-fetch">]><Map>&external;</Map>',
        ),
      ),
    ).toThrow(/DTD\/entity/);
    expect(() => buildFixture(baseline, strToU8('<!ENTITY a "recursive">'))).toThrow(/DTD\/entity/);
  });

  it("generates twice across timezones and runs both real CLI modes for every materialized fixture", () => {
    const runGenerator = (timezone: string) =>
      spawnSync(
        process.execPath,
        ["--experimental-strip-types", resolve("tools/mmap-corpus-cli.ts")],
        { encoding: "utf8", env: { ...process.env, TZ: timezone } },
      );
    const first = runGenerator("UTC");
    expect(first.status, first.stderr).toBe(0);
    const output = resolve(WORKSPACE_ROOT, ".tmp/mmap-corpus/synthetic");
    const firstBytes = generated.map((fixture) =>
      readFileSync(resolve(output, `${fixture.id}.mmap`)),
    );
    const firstNormalized = generated.map((fixture) =>
      readFileSync(resolve(output, `${fixture.id}.normalized.json`), "utf8"),
    );
    const second = runGenerator("Asia/Taipei");
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toBe(first.stdout);
    const index = JSON.parse(second.stdout) as {
      fixtures: { id: string; status: string; sha256: string | null }[];
    };
    expect(index.fixtures).toHaveLength(14);
    expect(index.fixtures[12]).toEqual({
      id: "13-summary",
      status: "pending-format-evidence",
      sha256: null,
    });
    generated.forEach((fixture, ordinal) => {
      const file = resolve(output, `${fixture.id}.mmap`);
      const bytes = readFileSync(file);
      expect(bytes).toEqual(firstBytes[ordinal]);
      expect(readFileSync(resolve(output, `${fixture.id}.normalized.json`), "utf8")).toBe(
        firstNormalized[ordinal],
      );
      expect(index.fixtures.find((entry) => entry.id === fixture.id)?.sha256).toBe(
        createHash("sha256").update(bytes).digest("hex"),
      );
      for (const mode of ["inspect", "normalize"]) {
        const cli = spawnSync(
          process.execPath,
          ["--experimental-strip-types", resolve("tools/mmap-cli.ts"), mode, file],
          { encoding: "utf8" },
        );
        expect(cli.status, cli.stderr).toBe(0);
        const actual = JSON.parse(cli.stdout);
        expect(actual.valid).toBe(true);
        if (mode === "normalize") expect(cli.stdout).toBe(firstNormalized[ordinal]);
        else expect(actual.document.inventory).toEqual(inspectMmap(bytes).document.inventory);
      }
    });
    expect(existsSync(resolve(output, "13-summary.mmap"))).toBe(false);
  }, 30_000);
});
