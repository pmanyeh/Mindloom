import { unzipSync } from "fflate";
import { type XmlInventory, inventoryDocument } from "./inventory.ts";
import { MAX_DOCUMENT_BYTES, checkZipDirectory } from "./zip-directory.ts";

type Category = "document" | "preview" | "bin" | "xsd" | "resource-like" | "unknown";
interface Entry {
  path: string;
  kind: "directory" | "file";
  uncompressedSize: number;
  compressedSize: number;
  compressionMethod: number;
  declaredCrc32: string;
  category: Category;
}
interface Issue {
  code: string;
  message: string;
}
export interface MmapInspection {
  schemaVersion: 1;
  inputFile: string | null;
  valid: boolean;
  package: {
    valid: boolean;
    validation: "ZIP32 structural bounds only; CRC/payload integrity not verified";
    entryCount: number;
    entries: Entry[];
  };
  document: {
    present: boolean;
    candidates: string[];
    path: string | null;
    size: number | null;
    encoding: string | null;
    wellFormed: boolean | null;
    inventory: XmlInventory | null;
  };
  preview: { present: boolean; paths: string[] };
  resources: { bin: string[]; xsd: string[]; resourceLike: string[] };
  unknown: {
    entries: string[];
    elements: XmlInventory["elements"];
    attributes: XmlInventory["attributes"];
  };
  issues: Issue[];
}

const comparePath = (a: Entry, b: Entry) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
function categoryOf(path: string): Category {
  const lower = path.toLowerCase();
  if (!lower.endsWith("/") && lower.split("/").at(-1) === "document.xml") return "document";
  if (/(^|\/)preview\.(png|jpe?g|bmp)$/.test(lower)) return "preview";
  if (lower.startsWith("bin/")) return "bin";
  if (lower.startsWith("xsd/")) return "xsd";
  if (
    /^(images|resources|attachments)\//.test(lower) ||
    /\.(png|jpe?g|gif|bmp|svg|emf|wmf|ico|tiff?)$/.test(lower)
  )
    return "resource-like";
  return "unknown";
}
function decodeDocument(bytes: Uint8Array): { xml: string; encoding: string } {
  const encoding =
    (bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0x3c && bytes[1] === 0)
      ? "utf-16le"
      : (bytes[0] === 0xfe && bytes[1] === 0xff) || (bytes[0] === 0 && bytes[1] === 0x3c)
        ? "utf-16be"
        : "utf-8";
  return { xml: new TextDecoder(encoding, { fatal: true }).decode(bytes), encoding };
}

/** Read-only inspector. It never imports the application's parser/model/UI or writes a package. */
export function inspectMmap(bytes: Uint8Array, inputFile: string | null = null): MmapInspection {
  const result: MmapInspection = {
    schemaVersion: 1,
    inputFile,
    valid: false,
    package: {
      valid: false,
      validation: "ZIP32 structural bounds only; CRC/payload integrity not verified",
      entryCount: 0,
      entries: [],
    },
    document: {
      present: false,
      candidates: [],
      path: null,
      size: null,
      encoding: null,
      wellFormed: null,
      inventory: null,
    },
    preview: { present: false, paths: [] },
    resources: { bin: [], xsd: [], resourceLike: [] },
    unknown: { entries: [], elements: [], attributes: [] },
    issues: [],
  };
  try {
    const crcs = checkZipDirectory(bytes);
    // Public fflate filter metadata comes from the central directory, including
    // data-descriptor archives. This pass does NOT decompress resource payloads.
    unzipSync(bytes, {
      filter: (info) => {
        result.package.entries.push({
          path: info.name,
          kind: info.name.endsWith("/") ? "directory" : "file",
          uncompressedSize: info.originalSize,
          compressedSize: info.size,
          compressionMethod: info.compression,
          declaredCrc32: crcs[result.package.entries.length],
          category: categoryOf(info.name),
        });
        return false;
      },
    });
    const entries = result.package.entries.sort(comparePath);
    if (new Set(entries.map((entry) => entry.path)).size !== entries.length)
      throw new Error("Duplicate ZIP entry paths are ambiguous and not supported.");
    result.package.entryCount = entries.length;
    result.package.valid = true;
  } catch (error) {
    result.package.entries = [];
    result.issues.push({
      code: "ZIP_INSPECTION_FAILED",
      message: error instanceof Error ? error.message : "Could not inspect ZIP.",
    });
    return result;
  }
  const pathsOf = (category: Category) =>
    result.package.entries
      .filter((entry) => entry.category === category)
      .map((entry) => entry.path);
  const pathsUnder = (prefix: string) =>
    result.package.entries
      .filter((entry) => entry.path.toLowerCase().startsWith(prefix))
      .map((entry) => entry.path);
  result.preview.paths = pathsOf("preview");
  result.preview.present = result.preview.paths.length > 0;
  result.resources = {
    bin: pathsUnder("bin/"),
    xsd: pathsUnder("xsd/"),
    resourceLike: pathsOf("resource-like"),
  };
  result.unknown.entries = pathsOf("unknown");
  const candidates = pathsOf("document");
  result.document.candidates = candidates;
  result.document.present = candidates.length > 0;
  if (candidates.length !== 1) {
    result.issues.push({
      code: candidates.length ? "AMBIGUOUS_DOCUMENT" : "MISSING_DOCUMENT",
      message: candidates.length
        ? "Multiple Document.xml candidates; no file was selected."
        : "No Document.xml file was found.",
    });
    return result;
  }
  const entry = result.package.entries.find(
    (candidate) => candidate.path === candidates[0],
  ) as Entry;
  result.document.path = entry.path;
  result.document.size = entry.uncompressedSize;
  try {
    if (entry.uncompressedSize > MAX_DOCUMENT_BYTES)
      throw new Error("Document.xml exceeds the 16 MiB inspection limit.");
    const extracted = unzipSync(bytes, { filter: (info) => info.name === entry.path })[entry.path];
    if (extracted.length !== entry.uncompressedSize)
      throw new Error("Document.xml decompressed size disagrees with the ZIP directory.");
    const { xml, encoding } = decodeDocument(extracted);
    result.document.encoding = encoding;
    let inventory: XmlInventory;
    try {
      inventory = inventoryDocument(xml);
    } catch (error) {
      result.document.wellFormed = false;
      throw error;
    }
    const declared = inventory.declarationEncoding?.toLowerCase().replaceAll("-", "");
    if (
      declared &&
      declared !== encoding.replaceAll("-", "") &&
      !(declared === "utf16" && encoding.startsWith("utf-16"))
    ) {
      throw new Error(
        `Unsupported or mismatched XML encoding declaration: ${inventory.declarationEncoding}`,
      );
    }
    result.document.inventory = inventory;
    result.document.wellFormed = true;
    result.unknown.elements = inventory.elements.filter(
      (element) => element.recognition === "unrecognized",
    );
    result.unknown.attributes = inventory.attributes.filter(
      (attribute) => attribute.recognition === "unrecognized",
    );
    result.valid = true;
  } catch (error) {
    result.issues.push({
      code: "DOCUMENT_INSPECTION_FAILED",
      message: error instanceof Error ? error.message : "Could not inspect Document.xml.",
    });
  }
  return result;
}
