// Only small synthetic inspector inputs. This is NOT the Phase 1 Batch 2 corpus.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Zip, ZipDeflate, ZipPassThrough, strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { inspectMmap } from "../src/formats/mmap/inspector";
import { inventoryDocument } from "../src/formats/mmap/inventory";
import { APPLICATION_NS } from "../src/formats/mmap/knowledge";
import { normalizeMmap } from "../src/formats/mmap/normalize";

const xml = readFileSync(resolve("test/fixtures/mmap-inspector/synthetic-basic.xml"), "utf8");
const fixed = { mtime: Date.parse("1980-01-01T00:00:00Z") };
const pack = (document = xml, extras: Record<string, Uint8Array> = {}) =>
  zipSync({ "Document.xml": [strToU8(document), fixed], ...extras }, { ...fixed, level: 6 });
const documentOnly = `<ap:Map xmlns:ap="${APPLICATION_NS}"><ap:OneTopic><ap:Topic OId="x"/></ap:OneTopic></ap:Map>`;
const sum = (records: { count: number }[]) =>
  records.reduce((total, record) => total + record.count, 0);
function centralOffset(bytes: Uint8Array): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
    bytes.length - 6,
    true,
  );
}

describe("MMAP package inspector — synthetic inputs", () => {
  it("inventories a valid package and reliably available central-directory metadata", () => {
    const result = inspectMmap(pack(), "synthetic.mmap");
    expect(result.inputFile).toBe("synthetic.mmap");
    expect(result.valid).toBe(true);
    expect(result.package.valid).toBe(true);
    expect(result.package.entryCount).toBe(1);
    expect(result.package.entries[0]).toMatchObject({
      path: "Document.xml",
      kind: "file",
      uncompressedSize: strToU8(xml).length,
      compressionMethod: 8,
      category: "document",
    });
    expect(result.package.entries[0].compressedSize).toBeLessThan(strToU8(xml).length);
    expect(result.package.entries[0].declaredCrc32).toMatch(/^[0-9a-f]{8}$/);
    expect(result.package.validation).toContain("integrity not verified");
    expect(result.document).toMatchObject({
      present: true,
      path: "Document.xml",
      size: strToU8(xml).length,
      encoding: "utf-8",
      wellFormed: true,
    });
  });

  it("distinguishes a valid ZIP missing Document.xml from a malformed ZIP", () => {
    const result = inspectMmap(zipSync({ "other.xml": strToU8("<x/>") }));
    expect(result.valid).toBe(false);
    expect(result.package.valid).toBe(true);
    expect(result.document.present).toBe(false);
    expect(result.issues[0].code).toBe("MISSING_DOCUMENT");
    expect(result.unknown.entries).toEqual(["other.xml"]);
    expect(inspectMmap(zipSync({})).issues[0].code).toBe("MISSING_DOCUMENT");
  });

  it.each([0, 8])(
    "reads central metadata in a streamed ZIP with data descriptors (method %i)",
    (method) => {
      const chunks: Uint8Array[] = [];
      const archive = new Zip((error, chunk) => {
        if (error) throw error;
        chunks.push(chunk);
      });
      const entry =
        method === 0 ? new ZipPassThrough("Document.xml") : new ZipDeflate("Document.xml");
      archive.add(entry);
      entry.push(strToU8(documentOnly), true);
      archive.end();
      const bytes = new Uint8Array(chunks.reduce((length, chunk) => length + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      const result = inspectMmap(bytes);
      expect(result.valid).toBe(true);
      expect(result.package.entries[0].compressionMethod).toBe(method);
      expect(result.package.entries[0].uncompressedSize).toBe(strToU8(documentOnly).length);
      expect(result.document.wellFormed).toBe(true);
    },
  );

  it("lists preview, bin, xsd, heuristic resources and unknown entries deterministically", () => {
    const result = inspectMmap(
      pack(xml, {
        "z-unknown.bin": new Uint8Array([3]),
        "Preview.png": new Uint8Array([1, 2]),
        "bin/": new Uint8Array(),
        "bin/a.bin": new Uint8Array([4]),
        "bin/Preview.png": new Uint8Array([5]),
        "xsd/synthetic.xsd": strToU8("synthetic metadata"),
        "images/a.svg": strToU8("<svg/>"),
        "custom/": new Uint8Array(),
      }),
    );
    const paths = result.package.entries.map((entry) => entry.path);
    expect(paths).toEqual([...paths].sort());
    expect(result.preview).toEqual({ present: true, paths: ["Preview.png", "bin/Preview.png"] });
    expect(result.resources).toEqual({
      bin: ["bin/", "bin/Preview.png", "bin/a.bin"],
      xsd: ["xsd/synthetic.xsd"],
      resourceLike: ["images/a.svg"],
    });
    expect(result.unknown.entries).toEqual(["custom/", "z-unknown.bin"]);
    expect(result.package.entries.find((entry) => entry.path === "bin/")?.kind).toBe("directory");
  });

  it("finds the exact case-sensitive path but refuses ambiguous document candidates", () => {
    const bytes = zipSync({ "nested/DOCUMENT.XML": strToU8(documentOnly) });
    expect(inspectMmap(bytes).document.path).toBe("nested/DOCUMENT.XML");
    const ambiguous = inspectMmap(pack(xml, { "nested/Document.xml": strToU8(documentOnly) }));
    expect(ambiguous.document.present).toBe(true);
    expect(ambiguous.document.path).toBeNull();
    expect(ambiguous.document.candidates).toEqual(["Document.xml", "nested/Document.xml"]);
    expect(ambiguous.issues[0].code).toBe("AMBIGUOUS_DOCUMENT");
  });

  it.each([new Uint8Array(), strToU8("not a ZIP"), new Uint8Array(100), pack().slice(0, -5)])(
    "fails clearly on non-ZIP or truncated input",
    (bytes) => {
      const result = inspectMmap(bytes);
      expect(result.valid).toBe(false);
      expect(result.package.valid).toBe(false);
      expect(result.issues[0].code).toBe("ZIP_INSPECTION_FAILED");
      expect(result.issues[0].message).toMatch(/ZIP/);
    },
  );

  it("rejects forged central headers and mismatched local filenames", () => {
    const badHeader = pack();
    badHeader[centralOffset(badHeader)] = 0;
    expect(inspectMmap(badHeader).package.valid).toBe(false);
    const badName = pack();
    badName[30] ^= 1;
    expect(inspectMmap(badName).issues[0].message).toContain("names disagree");
  });

  it("rejects ZIP64, multi-disk and encrypted input explicitly", () => {
    for (const variant of ["zip64", "disk", "encrypted"]) {
      const bytes = pack();
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      if (variant === "zip64") view.setUint16(bytes.length - 12, 0xffff, true);
      if (variant === "disk") view.setUint16(bytes.length - 18, 1, true);
      if (variant === "encrypted") view.setUint16(centralOffset(bytes) + 8, 1, true);
      const result = inspectMmap(bytes);
      expect(result.package.valid).toBe(false);
      expect(result.issues[0].message).toMatch(/ZIP64|multi-disk|encrypted/);
    }
  });

  it("bounds document extraction and reports unreadable XML separately from well-formedness", () => {
    const oversized = pack();
    const view = new DataView(oversized.buffer, oversized.byteOffset, oversized.byteLength);
    view.setUint32(centralOffset(oversized) + 24, 17 * 1024 * 1024, true);
    const result = inspectMmap(oversized);
    expect(result.package.valid).toBe(true);
    expect(result.document.wellFormed).toBeNull();
    expect(result.issues[0].message).toContain("16 MiB");
  });

  it("reports malformed XML without misclassifying the ZIP", () => {
    const result = inspectMmap(pack("<Map><Topic></Map>"));
    expect(result.valid).toBe(false);
    expect(result.package.valid).toBe(true);
    expect(result.document.wellFormed).toBe(false);
    expect(result.document.inventory).toBeNull();
    expect(result.issues[0].message).toMatch(/Malformed XML/);
  });

  it("reports declared CRC values as evidence, without claiming CRC verification", () => {
    const bytes = pack();
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    view.setUint32(centralOffset(bytes) + 16, 0x12345678, true);
    const result = inspectMmap(bytes);
    expect(result.package.entries[0].declaredCrc32).toBe("12345678");
    expect(result.package.validation).toContain("not verified");
  });

  it("decodes UTF-16 XML and rejects unsupported/mismatched encoding declarations", () => {
    const bytes = Buffer.from(
      `\ufeff<?xml version="1.0" encoding="UTF-16"?>${documentOnly}`,
      "utf16le",
    );
    expect(inspectMmap(zipSync({ "Document.xml": bytes })).document.encoding).toBe("utf-16le");
    expect(inspectMmap(zipSync({ "Document.xml": bytes })).valid).toBe(true);
    const unsupported = inspectMmap(
      pack(`<?xml version="1.0" encoding="ISO-8859-1"?>${documentOnly}`),
    );
    expect(unsupported.valid).toBe(false);
    expect(unsupported.issues[0].message).toContain("encoding declaration");
    expect(inspectMmap(zipSync({ "Document.xml": new Uint8Array([0xff]) })).valid).toBe(false);
  });
});

describe("MMAP XML inventory — namespace-aware inspection", () => {
  it("counts qualified elements, attributes, namespace declarations and repeated structural paths", () => {
    const inventory = inventoryDocument(xml);
    expect(inventory.namespaces.map((ns) => [ns.prefix, ns.uri])).toContainEqual([
      "ap",
      APPLICATION_NS,
    ]);
    expect(inventory.elements.find((element) => element.qualifiedName === "ap:Topic")?.count).toBe(
      3,
    );
    expect(
      inventory.attributes.find((attribute) => attribute.qualifiedName === "OId"),
    ).toMatchObject({ namespaceUri: "", count: 3, recognition: "known" });
    expect(
      inventory.paths.find(
        (path) => path.path === "/ap:Map/ap:OneTopic/ap:Topic/ap:SubTopics/ap:Topic",
      )?.count,
    ).toBe(2);
    expect(
      inventory.attributes.some((attribute) => attribute.qualifiedName.startsWith("xmlns")),
    ).toBe(false);
  });

  it("keeps unknown elements and attributes visible without invalidating the map", () => {
    const result = inspectMmap(pack());
    expect(result.valid).toBe(true);
    expect(result.unknown.elements[0]).toMatchObject({
      qualifiedName: "f:FutureFeature",
      namespaceUri: "urn:mindloom:synthetic-future",
      count: 1,
    });
    expect(result.unknown.attributes.map((attribute) => attribute.qualifiedName)).toEqual([
      "f:Flag",
      "f:Mode",
    ]);
  });

  it("recognizes alternate prefixes for the same URI and default namespaces", () => {
    const alternate = inventoryDocument(
      xml.replaceAll("ap:", "mm:").replace("xmlns:ap=", "xmlns:mm="),
    );
    const original = inventoryDocument(xml);
    expect(sum(alternate.elements.filter((element) => element.recognition === "known"))).toBe(
      sum(original.elements.filter((element) => element.recognition === "known")),
    );
    expect(
      alternate.elements.find((element) => element.qualifiedName === "mm:Topic")?.namespaceUri,
    ).toBe(APPLICATION_NS);
    const defaults = inventoryDocument(
      `<Map xmlns="${APPLICATION_NS}"><OneTopic><Topic OId="a"/></OneTopic></Map>`,
    );
    expect(defaults.elements.every((element) => element.recognition === "known")).toBe(true);
    expect(defaults.attributes[0].namespaceUri).toBe(""); // default namespace never applies to attributes
  });

  it("resolves scoped prefix rebindings and default namespace resets", () => {
    const inventory = inventoryDocument(
      `<Map xmlns="${APPLICATION_NS}" xmlns:f="urn:outer"><OneTopic><Topic><f:X xmlns:f="urn:inner" f:flag="1"/><X xmlns=""/></Topic></OneTopic></Map>`,
    );
    expect(
      inventory.elements.find((element) => element.qualifiedName === "f:X")?.namespaceUri,
    ).toBe("urn:inner");
    expect(inventory.elements.find((element) => element.qualifiedName === "X")?.namespaceUri).toBe(
      "",
    );
    expect(
      inventory.attributes.find((attribute) => attribute.qualifiedName === "f:flag")?.namespaceUri,
    ).toBe("urn:inner");
    expect(inventory.namespaces.some((ns) => ns.prefix === "f" && ns.uri === "urn:outer")).toBe(
      true,
    );
  });

  it("does not invent support for an unfamiliar generation or same-name foreign attributes", () => {
    const future = inspectMmap(
      pack(documentOnly.replace(APPLICATION_NS, "urn:synthetic:new-generation")),
    );
    expect(future.valid).toBe(true);
    expect(future.unknown.elements).toHaveLength(3);
    const foreign = inventoryDocument(
      `<ap:Map xmlns:ap="${APPLICATION_NS}" xmlns:f="urn:foreign"><ap:OneTopic><ap:Topic f:OId="x"/></ap:OneTopic></ap:Map>`,
    );
    expect(foreign.attributes[0].recognition).toBe("unrecognized");
    const misplaced = inventoryDocument(
      `<ap:Map xmlns:ap="${APPLICATION_NS}"><ap:Task TaskPriority="1"/></ap:Map>`,
    );
    expect(misplaced.elements.find((element) => element.localName === "Task")?.recognition).toBe(
      "unrecognized",
    );
  });

  it("recognizes Core Uri and emitted xsi metadata without claiming unknown styles are supported", () => {
    const inventory = inventoryDocument(
      `<ap:Map xmlns:ap="${APPLICATION_NS}" xmlns:c="http://schemas.mindjet.com/MindManager/Core/2003" xmlns:s="http://www.w3.org/2001/XMLSchema-instance" s:schemaLocation="opaque"><ap:OneTopic><ap:Topic><ap:OneImage><ap:Image><ap:ImageData ImageType="urn:mindjet:PngImage"><c:Uri>mmarch://bin/a.bin</c:Uri></ap:ImageData></ap:Image></ap:OneImage></ap:Topic></ap:OneTopic></ap:Map>`,
    );
    expect(inventory.elements.every((element) => element.recognition === "known")).toBe(true);
    expect(
      inventory.attributes.find((attribute) => attribute.localName === "schemaLocation")
        ?.recognition,
    ).toBe("known");
  });

  it.each([
    "<a><b></a>",
    "<a/><b/>",
    "<q:a/>",
    '<a xmlns:p="urn:x" xmlns:q="urn:x" p:x="1" q:x="2"/>',
    '<a xmlns:xml="urn:wrong"/>',
    '<a xmlns:p=""/>',
  ])("fails malformed or namespace-invalid XML clearly: %s", (bad) => {
    expect(() => inventoryDocument(bad)).toThrow(/XML|namespace/);
  });

  it("ignores comments/CDATA/processing instructions as elements and decodes namespace entities", () => {
    const inventory = inventoryDocument(
      '<r xmlns:f="urn:x?a=1&amp;b=2"><?custom x="y"?><!-- <ghost/> --><![CDATA[<ghost/>]]><f:X/></r>',
    );
    expect(sum(inventory.elements)).toBe(2);
    expect(
      inventory.elements.find((element) => element.qualifiedName === "f:X")?.namespaceUri,
    ).toBe("urn:x?a=1&b=2");
  });
});

describe("MMAP normalization and standalone CLI", () => {
  it("is byte deterministic, omits input paths, and keeps unknown structures", () => {
    const bytes = pack(xml, { "custom/opaque.bin": new Uint8Array([7]) });
    const originalBytes = bytes.slice();
    const first = normalizeMmap(inspectMmap(bytes, "first.mmap"));
    const second = normalizeMmap(inspectMmap(bytes, "relocated/second.mmap"));
    expect(first).toBe(second);
    expect(first).toBe(normalizeMmap(inspectMmap(bytes)));
    const parsed = JSON.parse(first);
    expect(parsed).not.toHaveProperty("inputFile");
    expect(parsed.unknown.entries).toEqual(["custom/opaque.bin"]);
    expect(parsed.unknown.elements[0].qualifiedName).toBe("f:FutureFeature");
    expect(parsed.unknown.attributes).toHaveLength(2);
    expect(first).not.toContain("timestamp");
    expect(bytes).toEqual(originalBytes);
  });

  it("sorts independent inventories consistently despite ZIP entry ordering", () => {
    const first = zipSync(
      { "z.bin": strToU8("z"), "Document.xml": strToU8(xml), "a.bin": strToU8("a") },
      fixed,
    );
    const second = zipSync(
      { "a.bin": strToU8("a"), "z.bin": strToU8("z"), "Document.xml": strToU8(xml) },
      fixed,
    );
    expect(normalizeMmap(inspectMmap(first))).toBe(normalizeMmap(inspectMmap(second)));
    const inventory = inventoryDocument(xml);
    expect(inventory.elements.map((element) => element.qualifiedName)).toEqual([
      "ap:Map",
      "ap:OneTopic",
      "ap:SubTopics",
      "ap:Text",
      "ap:Topic",
      "f:FutureFeature",
    ]);
    expect(inventory.attributes.map((attribute) => attribute.qualifiedName)).toEqual([
      "OId",
      "PlainText",
      "f:Flag",
      "f:Mode",
    ]);
    const paths = inventory.paths.map((entry) => entry.path);
    expect(paths).toEqual([...paths].sort());
  });

  it("runs the CLI in a plain Node subprocess and reports deterministic JSON and exit codes", () => {
    const directory = mkdtempSync(join(tmpdir(), "mindloom-inspector-"));
    try {
      const good = join(directory, "synthetic.mmap");
      const bad = join(directory, "bad.mmap");
      writeFileSync(good, pack());
      writeFileSync(bad, "not zip");
      const run = (...args: string[]) =>
        spawnSync(
          process.execPath,
          ["--experimental-strip-types", resolve("tools/mmap-cli.ts"), ...args],
          { encoding: "utf8" },
        );
      const inspect = run("inspect", good);
      expect(inspect.status, inspect.stderr).toBe(0);
      expect(JSON.parse(inspect.stdout).inputFile).toBe(good);
      const normalized = run("normalize", good);
      expect(normalized.status, normalized.stderr).toBe(0);
      expect(normalized.stdout).toBe(run("normalize", good).stdout);
      expect(JSON.parse(normalized.stdout)).not.toHaveProperty("inputFile");
      expect(run("inspect", bad).status).toBe(1);
      expect(JSON.parse(run("inspect", bad).stdout).package.valid).toBe(false);
      expect(run("inspect", join(directory, "missing.mmap")).stderr).toContain("inspection failed");
      expect(run("inspect").status).toBe(2);
      expect(run("inspect", "--help").status).toBe(0);
      expect(run("inspect", directory).status).toBe(1);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
