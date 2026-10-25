# Mindloom MMAP inspector — Phase 1 Batch 1

The inspector inventories packages and XML without importing the editor, its MMAP reader/writer, React, a browser DOM, IndexedDB or a canonical map model. It never writes an input or emits an edited `.mmap`.

## Commands

Use the existing Node/pnpm development environment. Node **22.12+** is required; the scripts explicitly enable Node's TypeScript stripping, avoiding a new runner dependency. Node 22 may print an experimental-feature warning on stderr. TypeScript checks the CLI through `tsconfig.json`; pnpm script discovery makes it an entry for the existing dead-code check.

```powershell
pnpm mmap-inspect path/to/input.mmap
pnpm --silent mmap-normalize path/to/input.mmap > normalized.json
pnpm exec vitest run test/mmap-inspector.test.ts test/phase0-mmap-audit.test.ts test/mmap.test.ts
pnpm gate
```

In this checkout, replace `pnpm` with `.\tools\phase0\pnpm-local.cmd` to use the already-installed isolated toolchain. A direct invocation, with no dev server or compilation step, is:

```powershell
node --experimental-strip-types tools/mmap-cli.ts inspect input.mmap
node --experimental-strip-types tools/mmap-cli.ts normalize input.mmap
```

`inspect` outputs formatted JSON including the supplied input filename. `normalize` outputs JSON without that filename. Exit codes: **0** inspection completed, **1** input could not be read/inspected, **2** incorrect CLI usage. Structurally invalid package/XML inputs produce a diagnostic JSON result and exit 1; filesystem failures go to stderr. Unknown structures do not produce a failure exit. No extension check is used as evidence of ZIP validity.

## Package observations and validation boundary

`src/formats/mmap/zip-directory.ts` performs bounded, read-only ZIP32 envelope/directory/local-header checks before calling `fflate.unzipSync`. It checks signatures, offsets, variable-length bounds, entry count, local/central filename agreement, flags and payload bounds. Header field layout is referenced from [PKWARE APPNOTE 6.3.10](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT), sections 4.3.7, 4.3.12 and 4.3.16; the specification is not copied into the repository.

The existing fflate public `UnzipFileInfo` filter supplies paths, compressed/uncompressed sizes and numeric compression methods from the central directory. An inventory-only pass returns `false` for every resource, so attachments/images are not inflated. Only the selected `Document.xml` is decompressed on the second pass. Stored and deflated entries, including streamed archives using data descriptors, are tested.

`package.valid` means the **supported ZIP32 structural inspection passed**, not that every payload/CRC is correct or that MindManager accepts the file. `valid` at the report root additionally requires exactly one readable, well-formed, namespace-consistent XML document. There is no XSD validation. Unsupported ZIP variants also fail this supported-inspection check with an explicit diagnostic; that is not evidence that the original archive is inherently invalid.

### Metadata and limits

- Every entry reports exact decoded path, file/directory kind (trailing `/` convention), uncompressed size, compressed size, compression method, declared CRC32 and classification.
- fflate's public metadata does **not** expose CRC. The small ZIP32 bounds reader safely reads the central directory's declared CRC field and labels it `declaredCrc32`, eight lowercase hexadecimal digits. **CRC is not recalculated or verified.** The report includes that limitation rather than claiming archive integrity.
- Directory metadata, timestamps, extra-field semantics, digital signatures and archive comments are not normalized. File bytes are not preserved/extracted to disk. Legacy non-UTF-8 filenames follow fflate's byte-to-string decoding and are not a verified CP437/local-codepage conversion.
- Limits: 64 MiB input, 10,000 entries, 16 MiB declared XML size, 100 XML nesting levels and bounded parser entity expansion. Oversized inputs fail explicitly.
- Batch 1 rejects ZIP64, multi-disk, encrypted archives, duplicate decoded entry names and unsupported directory arrangements. There is no password handling or repair. Extra directory records/digital-signature arrangements may be rejected.
- Document selection is case-insensitive basename matching for `Document.xml`, including a nested directory. The exact selected path is reported; multiple candidates are an error rather than an arbitrary selection. A directory named `Document.xml/` is not a candidate.
- `document.wellFormed` is `null` when XML was not parsed, `false` when XML/namespace inspection failed, and `true` after successful inspection. Package and document status remain distinct.
- UTF-8 and UTF-16 LE/BE are decoded using BOM/byte signatures and fatal decoding. Unsupported/mismatched encoding declarations fail clearly. This is not an exhaustive XML-encoding implementation.

## Package classification

Classification is limited knowledge, not a file whitelist or a schema:

| Category | Rule |
|---|---|
| document | A non-directory whose basename is `Document.xml`, ignoring case |
| preview | Basename `Preview.png`, `Preview.jpg/jpeg` or `Preview.bmp`, ignoring case |
| bin | Root `bin/` entries, ignoring case |
| xsd | Root `xsd/` entries, ignoring case; contents are not validated |
| resource-like | Root `images/`, `resources/`, `attachments/`, or common image extensions; heuristic only |
| unknown | Everything not matched above, including unknown directories |

Entries are listed once in the manifest and grouped into preview/resource/unknown lists. Location groups include all `bin/` and `xsd/` paths even when the entry also has a more specific category; e.g. `bin/Preview.png` appears in both the preview and bin lists. Classification is lexical and does not follow XML links or certify that images/resources are usable. Unknown binary entries remain visible as metadata; they are not saved anywhere in a map document.

## XML inventory and recognition

`inventory.ts` uses the already-installed **fast-xml-parser 4.5.6**, with `XMLValidator` followed by ordered parsing. Prefixes/attributes are retained, tag/attribute numeric coercion is disabled, and the traversal does not use regular expressions as an XML parser. Comments, CDATA and processing instructions are not counted as elements. The XML declaration's encoding is separately recorded. DTD/schema validation, entity-definition inventory and a complete XML conformance checker are outside this batch; external resources are not fetched. Parser-reserved element names may be rejected explicitly rather than silently renamed.

Each element receives a cloned inherited namespace scope. Declarations on that element apply to its own name/attributes; prefix rebinding and default namespace resets remain local. Default namespaces apply to elements, **not unprefixed attributes**. The predefined `xml` binding is recognized. Unbound prefixes, illegal reserved bindings, multiple roots and duplicate attributes with the same expanded name are rejected.

The inventory reports:

- Namespace declarations: prefix, URI, declaring qualified path, occurrence count. `xmlns` declarations are listed here, not again as ordinary attributes.
- Elements: qualified name, local name, resolved URI, known/unrecognized classification, count.
- Attributes: the same name/namespace information, owner element and count. Namespaced attributes cannot masquerade as an unqualified known attribute.
- Paths: qualified structural path, expanded-name segment array and occurrence count. Expanded names distinguish identical lexical paths under namespace rebinding. Repeated siblings share a path count; no positional IDs are invented.

`knowledge.ts` is an explicit vocabulary of actual current adapter observations, with source evidence named in its header. It recognizes local names only in documented namespaces and parent transitions read/emitted by `src/import/mmap.ts` / `src/io/mmap.ts`. It distinguishes App/Core URI elements and emitted XSI scaffolding. Limited XHTML notes wrappers are known only for text traversal/line breaks. It is **not** an invented complete MindManager schema, nor a statement that those fields survive writing.

The parser inventories any namespace URI without assuming every file uses the 2003 generation. Recognition is deliberately conservative: unfamiliar generations, foreign attributes and misplaced known local names are unrecognized. Add evidence-backed rules and tests as future adapters become understood.

**Unknown means “not recognized by the current Mindloom adapter vocabulary.” It does not mean invalid MindManager content, unsupported by MindManager, corrupt, editable, or round-trip safe.** An unknown element's descendants are still inventoried. Prefix aliases for the same URI receive the same recognition, while their original qualified names remain visible.

## Normalization contract (schemaVersion 1)

`normalize.ts` serializes inspection evidence only. The inspector sorts manifests by decoded path and count records by explicit tuple keys using JavaScript code-unit order; it never uses the machine locale. Counts group repeated names/paths; namespaces, unknown groups and package categories remain visible. Object field order and JSON indentation/newline are fixed. No generated timestamps or random IDs are emitted. Relocating identical bytes does not affect normalization because `inputFile` is excluded.

This is **structural evidence**, not a semantic topic representation: topic text and general attribute values are not included. Different source ZIP CRC/compression metadata or qualified namespace prefixes can produce different normalized JSON even if some map semantics are equivalent. Conversely, identical structural inventories do not establish semantic equality. No content hashes, source-ID mappings, unknown subtrees, raw XML or source package snapshots are attached to canonical documents.

## Minimal synthetic example

The single checked-in XML fixture is `test/fixtures/mmap-inspector/synthetic-basic.xml`. It is explicitly synthetic and has not been generated/opened by MindManager. Tests construct only small in-memory packages around it; malformed/alternate-namespace inputs are programmatic. This is not the 14-case P1C corpus.

With Node on PATH, create one disposable example from the repository root:

```powershell
@'
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { strToU8, zipSync } from "fflate";
mkdirSync(".tmp", { recursive: true });
writeFileSync(".tmp/mmap-inspector-synthetic.mmap", zipSync({
  "Document.xml": readFileSync("test/fixtures/mmap-inspector/synthetic-basic.xml"),
  "Preview.png": new Uint8Array([1, 2]), // synthetic byte placeholder, not an image claim
  "bin/": new Uint8Array(),
  "bin/synthetic.bin": new Uint8Array([3]),
  "xsd/synthetic.xsd": strToU8("synthetic placeholder, not a real XSD"),
  "images/synthetic.svg": strToU8("<svg/>"),
  "custom/opaque.dat": new Uint8Array([7, 8])
}, { mtime: Date.parse("1980-01-01T00:00:00Z"), level: 6 }));
'@ | node --input-type=module
pnpm --silent mmap-inspect .tmp/mmap-inspector-synthetic.mmap
pnpm --silent mmap-normalize .tmp/mmap-inspector-synthetic.mmap
```

Representative complete output and test/gate evidence are linked from [phase1-batch1-report.md](../../phase1-batch1-report.md).

## Dependencies and phase boundary

No dependency or lockfile changes. Reused fflate 0.8.3 (MIT) and fast-xml-parser 4.5.6 (MIT), already inventoried in Phase 0. Node's existing built-ins provide file I/O/decoding; TypeScript 5.9.3 is the existing checker. The ZIP bounds reader and inspection vocabulary are new Mindloom code based on format/implementation observations; no AGPL implementation, proprietary binaries, schema files or customer data are added.

No Phase 2 preservation behavior was implemented. No model fields, save/patch logic, identity preservation, dirty tracking, UI warnings or editor changes are part of these tools. Batch 2 synthetic corpus, Batch 3 real corpus and later phases remain unauthorised by this batch.
