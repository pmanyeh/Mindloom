// Maploom Phase 0 evidence only. These tests describe upstream losses; passing
// does not certify fidelity. Replace the loss expectations when preservation lands.
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { parseMmap } from "../src/import/mmap";
import { toMmap } from "../src/io/mmap";

const NS = "http://schemas.mindjet.com/MindManager/Application/2003";
const wrap = (topic: string, extra = "") =>
  `<ap:Map xmlns:ap="${NS}" xmlns:future="urn:maploom:synthetic-future"><ap:OneTopic>${topic}</ap:OneTopic>${extra}</ap:Map>`;
const topic = (content = "", attrs = "") =>
  `<ap:Topic OId="source-root" ${attrs}><ap:Text PlainText="Root"/>${content}</ap:Topic>`;
const pack = (xml: string, extras: Record<string, Uint8Array> = {}) =>
  zipSync({ "Document.xml": strToU8(xml), ...extras });
const xmlOf = (bytes: Uint8Array) => strFromU8(unzipSync(bytes)["Document.xml"]);

describe("Maploom Phase 0 — upstream MMAP loss witnesses", () => {
  it("drops unknown package entries, preview and schema bytes on an unedited save", () => {
    const bytes = pack(wrap(topic()), {
      "custom/future.bin": new Uint8Array([0, 255, 7]),
      "Preview.png": new Uint8Array([1, 2, 3]),
      "xsd/synthetic.xsd": strToU8("synthetic audit marker"),
    });
    const imported = parseMmap(bytes);
    expect(imported.warnings).toEqual([]);
    expect(Object.keys(unzipSync(toMmap(imported.doc)))).toEqual(["Document.xml"]);
  });

  it("drops unknown XML subtrees and attributes without an import warning", () => {
    const imported = parseMmap(
      pack(wrap(topic('<future:Payload Keep="yes">opaque</future:Payload>', 'future:Flag="yes"'))),
    );
    expect(imported.warnings).toEqual([]);
    const output = xmlOf(toMmap(imported.doc));
    expect(output).not.toContain("future:");
    expect(output).not.toContain("opaque");
  });

  it("keeps a topic OId on import but changes it on every import/export cycle", () => {
    const first = parseMmap(pack(wrap(topic()))).doc;
    const bytes = toMmap(first);
    expect(toMmap(first)).toEqual(bytes); // same model is byte deterministic
    const second = parseMmap(bytes).doc;
    const third = parseMmap(toMmap(second)).doc;
    expect(first.root.id).toBe("source-root");
    expect(second.root.id).not.toBe(first.root.id);
    expect(third.root.id).not.toBe(second.root.id);
  });

  it("imports an attachment then silently omits it and its bytes on export", () => {
    const attachment = `<ap:AttachmentGroup><ap:AttachmentData FileName="synthetic.txt" Type="urn:mindjet:File"><ap:Uri>mmarch://bin/attachment.bin</ap:Uri></ap:AttachmentData></ap:AttachmentGroup>`;
    const first = parseMmap(
      pack(wrap(topic(attachment)), { "bin/attachment.bin": strToU8("audit-only") }),
    );
    expect(first.doc.root.attachments?.[0].name).toBe("synthetic.txt");
    expect(first.warnings).toEqual([]);
    const bytes = toMmap(first.doc);
    expect(Object.keys(unzipSync(bytes))).toEqual(["Document.xml"]);
    expect(parseMmap(bytes).doc.root.attachments).toBeUndefined();
  });

  it("imports explicit topic styling but loses it when saved", () => {
    const first = parseMmap(
      pack(wrap(topic('<ap:Color FillColor="ff123456" LineColor="ff654321"/>'))),
    ).doc;
    expect(first.root.style?.background).toBe("#123456");
    expect(parseMmap(toMmap(first)).doc.root.style).toBeUndefined();
  });

  it("flattens full XHTML notes and writes only PreviewPlainText", () => {
    const notes = `<ap:NotesGroup><ap:NotesXhtmlData PreviewPlainText="short"><html xmlns="http://www.w3.org/1999/xhtml"><body><p>Full <b>note</b></p></body></html></ap:NotesXhtmlData></ap:NotesGroup>`;
    const first = parseMmap(pack(wrap(topic(notes)))).doc;
    expect(first.root.note).toContain("Full");
    expect(first.root.note).toContain("note");
    const bytes = toMmap(first);
    expect(parseMmap(bytes).doc.root.note).toBe(first.root.note);
    expect(xmlOf(bytes)).toContain("PreviewPlainText=");
    expect(xmlOf(bytes)).not.toContain("<html");
    expect(xmlOf(bytes)).not.toContain("<b>");
  });

  it("accepts the same local names in an unrelated namespace", () => {
    const imported = parseMmap(pack(wrap(topic()).replace(NS, "urn:maploom:not-mindmanager")));
    expect(imported.doc.root.topic).toBe("Root");
    expect(imported.warnings).toEqual([]);
  });

  it("writes collapse state but does not read it back", () => {
    const first = parseMmap(pack(wrap(topic()))).doc;
    first.root.collapsed = true;
    const bytes = toMmap(first);
    expect(xmlOf(bytes)).toContain('Collapsed="true"');
    expect(parseMmap(bytes).doc.root.collapsed).toBeUndefined();
  });

  it("keeps relationship endpoints and boundary membership while losing their styling", () => {
    const child = `<ap:SubTopics><ap:Topic OId="source-child"><ap:Text PlainText="Child"/></ap:Topic></ap:SubTopics>`;
    const boundary = `<ap:OneBoundary><ap:Boundary><ap:Color LineColor="ff123456"/></ap:Boundary></ap:OneBoundary>`;
    const connections = ["source-root", "source-child"]
      .map(
        (id) =>
          `<ap:ConnectionGroup><ap:Connection><ap:ObjectReference OIdRef="${id}"/></ap:Connection></ap:ConnectionGroup>`,
      )
      .join("");
    const relations = `<ap:Relationships><ap:Relationship><ap:Color LineColor="ff123456"/>${connections}</ap:Relationship></ap:Relationships>`;
    const first = parseMmap(pack(wrap(topic(child + boundary), relations))).doc;
    expect(first.links?.[0].color).toBe("#123456");
    expect(first.boundaries?.[0].color).toBe("#123456");
    const second = parseMmap(toMmap(first)).doc;
    expect(second.links?.[0].from).toBe(second.root.id);
    expect(second.links?.[0].to).toBe(second.root.children[0].id);
    expect(second.links?.[0].color).toBeUndefined();
    expect(second.boundaries?.[0].nodeIds).toEqual([second.root.id, second.root.children[0].id]);
    expect(second.boundaries?.[0].color).toBeUndefined();
  });

  it("normalizes task time to a date, rounds progress and drops unmapped scheduling fields", () => {
    const task = `<ap:Task TaskPercentage="12.5" StartDate="2026-10-25T14:30:00" DeadlineDate="2026-10-26T18:00:00" Duration="PT12H" Cost="42"/>`;
    const first = parseMmap(pack(wrap(topic(task)))).doc;
    expect(first.root.task?.progress).toBe(0.125);
    expect(first.root.task?.start).toBe("2026-10-25");
    const bytes = toMmap(first);
    expect(parseMmap(bytes).doc.root.task?.progress).toBe(0.13);
    expect(xmlOf(bytes)).not.toContain('Cost="42"');
    expect(xmlOf(bytes)).not.toContain("PT12H");
  });
});
