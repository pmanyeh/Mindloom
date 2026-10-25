// Mindloom inspection vocabulary v1 — implementation evidence, NOT a MindManager schema.
// Sources: src/import/mmap.ts (extractors/topicToNode), src/io/mmap.ts (XML emit), P0B audit.
export const APPLICATION_NS = "http://schemas.mindjet.com/MindManager/Application/2003";
const CORE_NS = "http://schemas.mindjet.com/MindManager/Core/2003";
const XHTML_NS = "http://www.w3.org/1999/xhtml";
const XSI_NS = "http://www.w3.org/2001/XMLSchema-instance";

export interface XmlName {
  qualifiedName: string;
  localName: string;
  namespaceUri: string;
}

// Only transitions read or emitted by the current adapters. A known name under
// an unrelated parent/namespace is not automatically a known structure.
const children: Record<string, string[]> = {
  "": ["Map"],
  Map: ["OneTopic", "Topic", "Relationships", "FloatingTopics", "StyleGroup"],
  OneTopic: ["Topic"],
  Topic: [
    "Text",
    "NotesGroup",
    "Notes",
    "IconsGroup",
    "TextLabels",
    "Color",
    "Task",
    "OneImage",
    "AttachmentGroup",
    "FloatingTopics",
    "Offset",
    "SubTopics",
    "OneBoundary",
    "SubTopicShape",
    "Hyperlink",
    "CalloutFloatingTopicShape",
    "TopicViewGroup",
    "SubTopicsShape",
  ],
  Text: ["Font", "FontRange"],
  NotesGroup: ["NotesXhtmlData"],
  Notes: ["CDATA"],
  IconsGroup: ["Icons"],
  Icons: ["Icon"],
  TextLabels: ["TextLabel"],
  OneImage: ["Image"],
  Image: ["ImageData", "AlternateImageData", "ImageSize"],
  ImageData: ["Uri"],
  AlternateImageData: ["Uri"],
  AttachmentGroup: ["AttachmentData"],
  AttachmentData: ["Uri"],
  FloatingTopics: ["Topic"],
  SubTopics: ["Topic"],
  OneBoundary: ["Boundary"],
  Boundary: ["Color", "BoundaryShape", "LineStyle"],
  Relationships: ["Relationship"],
  Relationship: ["Text", "Color", "LineStyle", "ConnectionGroup"],
  ConnectionGroup: ["Connection"],
  Connection: ["ObjectReference", "DefaultConnectionStyle"],
  StyleGroup: ["BackgroundFill", "RootTopicDefaultsGroup"],
  RootTopicDefaultsGroup: ["DefaultColor", "DefaultText"],
  DefaultText: ["Font"],
  TopicViewGroup: ["Collapsed"],
};

const attributes: Record<string, string[]> = {
  Map: ["OId", "Dirty", "Gen"],
  Topic: ["OId", "Dirty", "Gen"],
  Text: ["PlainText", "Text", "ReadOnly"],
  NotesXhtmlData: ["PreviewPlainText"],
  CDATA: ["Text"],
  TextLabel: ["TextLabelName", "Name"],
  Color: ["FillColor", "LineColor"],
  Font: ["Color", "Name", "Size", "Bold", "Underline"],
  FontRange: ["From", "To", "Bold", "Italic", "Underline", "Strikethrough", "Color"],
  Task: ["TaskPriority", "TaskPercentage", "StartDate", "DeadlineDate", "Resources"],
  ImageData: ["ImageType"],
  AlternateImageData: ["ImageType"],
  ImageSize: ["Width", "Height"],
  AttachmentData: ["Type", "FileName"],
  SubTopicShape: ["SubTopicShape"],
  BoundaryShape: ["BoundaryShape"],
  LineStyle: ["LineDashStyle", "LineWidth"],
  DefaultConnectionStyle: ["ConnectionShape"],
  Icon: ["IconType"],
  Hyperlink: ["Url"],
  Offset: ["CX", "CY"],
  ObjectReference: ["OIdRef"],
  BackgroundFill: ["FillColor"],
  DefaultColor: ["Dirty", "FillColor", "LineColor"],
  DefaultText: ["Dirty", "TextAlignment", "VerticalTextAlignment"],
  Collapsed: ["Collapsed"],
  SubTopicsShape: ["SubTopicsGrowthDirection"],
};
const noteWrappers = new Set([
  "html",
  "body",
  "p",
  "div",
  "br",
  "li",
  "tr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "table",
]);

export function knownElement(name: XmlName, parent: XmlName | null, inNotes: boolean): boolean {
  if (inNotes && (name.namespaceUri === XHTML_NS || name.namespaceUri === "")) {
    // collectXhtmlText: traversal/line breaks only; not rich-note editing support.
    return noteWrappers.has(name.localName);
  }
  const allowedNamespace =
    name.namespaceUri === APPLICATION_NS ||
    (name.localName === "Uri" && name.namespaceUri === CORE_NS);
  return (
    allowedNamespace &&
    (!parent || parent.namespaceUri === APPLICATION_NS) &&
    (children[parent?.localName ?? ""] ?? []).includes(name.localName)
  );
}

export function knownAttribute(name: XmlName, owner: XmlName, ownerKnown: boolean): boolean {
  if (!ownerKnown) return false;
  if (owner.localName === "Map" && name.namespaceUri === XSI_NS) {
    return name.localName === "schemaLocation"; // emitted scaffolding, not schema validation
  }
  return name.namespaceUri === "" && (attributes[owner.localName] ?? []).includes(name.localName);
}
