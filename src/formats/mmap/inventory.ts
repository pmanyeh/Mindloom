import { XMLParser, XMLValidator } from "fast-xml-parser";
import { APPLICATION_NS, type XmlName, knownAttribute, knownElement } from "./knowledge.ts";

const XML_NS = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NS = "http://www.w3.org/2000/xmlns/";
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
type Recognition = "known" | "unrecognized";
export interface ElementCount extends XmlName {
  count: number;
  recognition: Recognition;
}
export interface AttributeCount extends ElementCount {
  owner: XmlName;
}
export interface NamespaceCount {
  prefix: string;
  uri: string;
  path: string;
  count: number;
}
export interface PathCount {
  path: string;
  expandedPath: string[];
  count: number;
}
export interface XmlInventory {
  declarationEncoding: string | null;
  root: XmlName;
  namespaces: NamespaceCount[];
  elements: ElementCount[];
  attributes: AttributeCount[];
  paths: PathCount[];
}
interface OrderedNode {
  [key: string]: unknown;
}
interface Frame {
  nodes: OrderedNode[];
  scope: Map<string, string>;
  path: string;
  expandedPath: string[];
  parent: XmlName | null;
  parentKnown: boolean;
  inNotes: boolean;
}

function nameOf(qualifiedName: string, scope: Map<string, string>, attribute = false): XmlName {
  const parts = qualifiedName.split(":");
  if (parts.length > 2 || parts.some((part) => !part) || qualifiedName.startsWith("#")) {
    throw new Error(`Unsupported or malformed XML qualified name: ${qualifiedName}`);
  }
  const prefix = parts.length === 2 ? parts[0] : "";
  if (prefix && !scope.get(prefix)) throw new Error(`Unbound XML namespace prefix: ${prefix}`);
  return {
    qualifiedName,
    localName: parts.at(-1) as string,
    namespaceUri: attribute && !prefix ? "" : (scope.get(prefix) ?? ""),
  };
}

function addCount<T extends { count: number }>(store: Map<string, T>, key: string, value: T): void {
  const existing = store.get(key);
  if (existing) existing.count++;
  else store.set(key, value);
}
function sorted<T>(store: Map<string, T>): T[] {
  return [...store.entries()].sort(([a], [b]) => compare(a, b)).map(([, value]) => value);
}

/** Namespace-aware structural inventory, without a DOM, canonical map or raw-XML sidecar. */
export function inventoryDocument(xml: string): XmlInventory {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    const { msg, line, col } = validation.err;
    throw new Error(`Malformed XML at ${line}:${col}: ${msg}`);
  }
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    removeNSPrefix: false,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    ignorePiTags: false,
    commentPropName: "#comment",
    cdataPropName: "#cdata",
    maxNestedTags: 100,
    processEntities: {
      enabled: true,
      maxEntitySize: 10_000,
      maxEntityCount: 100,
      maxExpansionDepth: 10,
      maxTotalExpansions: 1_000,
      maxExpandedLength: 100_000,
    },
  });
  const nodes = parser.parse(xml) as OrderedNode[];
  const declaration = nodes.find((node) => "?xml" in node)?.[":@"] as
    | Record<string, string>
    | undefined;
  const namespaces = new Map<string, NamespaceCount>();
  const elements = new Map<string, ElementCount>();
  const attributes = new Map<string, AttributeCount>();
  const paths = new Map<string, PathCount>();
  let root: XmlName | undefined;
  const stack: Frame[] = [
    {
      nodes,
      scope: new Map([
        ["xml", XML_NS],
        ["", ""],
      ]),
      path: "",
      expandedPath: [],
      parent: null,
      parentKnown: true,
      inNotes: false,
    },
  ];
  while (stack.length) {
    const frame = stack.pop() as Frame;
    for (const node of frame.nodes) {
      const qualifiedName = Object.keys(node).find((key) => key !== ":@");
      if (
        !qualifiedName ||
        ["#text", "#comment", "#cdata"].includes(qualifiedName) ||
        qualifiedName.startsWith("?")
      )
        continue;
      const path = `${frame.path}/${qualifiedName}`;
      const scope = new Map(frame.scope);
      const attrs = (node[":@"] ?? {}) as Record<string, string>;
      for (const [key, uri] of Object.entries(attrs)) {
        const name = key.slice(2); // fast-xml-parser's @_ attribute prefix
        if (name !== "xmlns" && !name.startsWith("xmlns:")) continue;
        const prefix = name === "xmlns" ? "" : name.slice(6);
        if (
          prefix.includes(":") ||
          prefix === "xmlns" ||
          uri === XMLNS_NS ||
          (prefix === "xml" ? uri !== XML_NS : uri === XML_NS) ||
          (prefix !== "" && uri === "")
        ) {
          throw new Error(`Invalid XML namespace declaration at ${path}: ${name}`);
        }
        scope.set(prefix, uri);
        addCount(namespaces, JSON.stringify([path, prefix, uri]), { prefix, uri, path, count: 1 });
      }
      const name = nameOf(qualifiedName, scope);
      if (!frame.parent) {
        if (root) throw new Error("Malformed XML: multiple document elements.");
        root = name;
      }
      const known = frame.parentKnown && knownElement(name, frame.parent, frame.inNotes);
      const recognition: Recognition = known ? "known" : "unrecognized";
      addCount(elements, JSON.stringify([qualifiedName, name.namespaceUri, recognition]), {
        ...name,
        recognition,
        count: 1,
      });
      const expandedPath = [...frame.expandedPath, `{${name.namespaceUri}}${name.localName}`];
      addCount(paths, JSON.stringify([path, expandedPath]), { path, expandedPath, count: 1 });
      const expandedAttrs = new Set<string>();
      for (const key of Object.keys(attrs)) {
        const attrName = key.slice(2);
        if (attrName === "xmlns" || attrName.startsWith("xmlns:")) continue;
        const attr = nameOf(attrName, scope, true);
        const expanded = JSON.stringify([attr.namespaceUri, attr.localName]);
        if (expandedAttrs.has(expanded))
          throw new Error(`Duplicate expanded XML attribute at ${path}: ${attrName}`);
        expandedAttrs.add(expanded);
        const state: Recognition = knownAttribute(attr, name, known) ? "known" : "unrecognized";
        addCount(
          attributes,
          JSON.stringify([attrName, attr.namespaceUri, qualifiedName, name.namespaceUri, state]),
          { ...attr, owner: name, recognition: state, count: 1 },
        );
      }
      stack.push({
        nodes: node[qualifiedName] as OrderedNode[],
        scope,
        path,
        expandedPath,
        parent: name,
        parentKnown: known,
        inNotes:
          frame.inNotes ||
          (known && name.localName === "NotesXhtmlData" && name.namespaceUri === APPLICATION_NS),
      });
    }
  }
  if (!root) throw new Error("Malformed XML: no document element.");
  return {
    declarationEncoding: declaration?.["@_encoding"] ?? null,
    root,
    namespaces: sorted(namespaces),
    elements: sorted(elements),
    attributes: sorted(attributes),
    paths: sorted(paths),
  };
}
