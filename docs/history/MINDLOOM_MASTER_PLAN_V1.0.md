# MINDLOOM_MASTER_PLAN.md

> **Project name:** Mindloom
> **Project type:** MindManager-compatible mind-map editor  
> **Primary goal:** High-fidelity `.mmap` round-trip compatibility without depending on MindManager at runtime  
> **Preferred base:** MindMap Studio (Apache-2.0)  
> **Fallback editor core:** Mind Elixir Core (MIT) / React Flow-based custom implementation  
> **Target platform:** Windows first; architecture must remain cross-platform where practical  
> **Primary language:** TypeScript / React  
> **Status:** Master Plan v1.0  
> **Date:** 2026-10-25

---

# 0. Executive Summary

Mindloom 不是要「複製 MindManager 原始碼」，也不是以 pixel-perfect clone 為第一優先。

真正目標是建立一套：

> **Mindloom：可以取代日常 MindManager 使用、能可靠開啟／編輯／儲存 `.mmap`，並盡量不破壞不認識資料的相容編輯器。**

Mindloom 不把自己限制成 MindManager clone；長期定位是可處理多種 mind-map 格式、但以 `.mmap` 高相容 round-trip 為首要突破口的開放式編輯器。

建議不再以舊版 XMind 原始碼為核心。

目前更適合的工程起點是：

1. **Fork MindMap Studio**
   - Apache-2.0
   - React + TypeScript
   - React Flow canvas
   - 已有 format-agnostic canonical model
   - 已有 `.mmap` importer / writer
   - 已有 XMind、FreeMind、OPML、Markdown 等 interchange adapters
   - 已有許多 MindManager-like 編輯功能

2. 在其上新增真正的 **MMAP Compatibility Layer**
   - Package-level preservation
   - XML-level preservation
   - Unknown/unsupported data preservation
   - Schema/version detection
   - Deterministic writer
   - Semantic round-trip tests

3. 使用真正 MindManager 作為 **Compatibility Oracle**
   - COM Automation（可用時）
   - 手動 UI 驗證
   - `.mmap` before/after diff
   - REA black-box 行為研究

4. REA 僅用於研究「外部可觀察行為」
   - Interaction
   - Layout
   - Shortcut
   - Style inheritance
   - Boundary/relationship behavior
   - Task calculation behavior
   - Save/load observable effects

5. 不從 proprietary binary/code 複製實作。
   - 以 interoperability、file-format compatibility、black-box behavior 為中心。
   - 第三方 AGPL 工具僅可作研究/驗證工具，除非專案正式接受 AGPL。

---

# 1. Project Goals

## 1.1 Primary Goal

建立 Mindloom：一套可在沒有 MindManager 的環境中正常使用的 mind-map editor，並達到：

```text
MindManager
    ↓
 A.mmap
    ↓
Our Editor
    ↓
修改內容
    ↓
 B.mmap
    ↓
MindManager
    ↓
正常開啟
```

且：

```text
原本可支援資料
+ 未被我們編輯的資料
+ 尚未理解的資料

應盡可能被保留。
```

---

## 1.2 MVP Success Definition

第一個真正有價值的 MVP 不以功能數量判斷，而以 **round-trip fidelity** 判斷。

MVP 必須做到：

- 開啟真實 MindManager `.mmap`
- 顯示 topic tree
- 編輯 topic text
- 新增 child / sibling topic
- 移動 / reparent topic
- 編輯 note
- 編輯 basic markers/tags
- Save As `.mmap`
- 真正 MindManager 能重新開啟輸出檔
- 未修改的基本樣式盡可能保留
- 未理解的 package resources 不任意刪除
- 對不支援內容提出 compatibility warning

---

## 1.3 Long-term Goal

逐步支援：

- Topic
- Floating Topic
- Callout
- Relationship
- Boundary
- Summary
- Notes
- Hyperlinks
- Attachments
- Images
- Icons / Markers
- Tags
- Priority
- Progress
- Start/Due dates
- Resources
- Cost / Effort（若格式允許）
- Layout
- Styles
- Theme
- Filters
- Task roll-up
- Gantt-related metadata
- Map parts / links
- Map-level metadata
- Multiple MindManager file generations
- XMind interchange
- Other open formats

---

# 2. Non-Goals

第一階段明確不做：

- 不追求 100% UI pixel clone
- 不複製 MindManager 商標與品牌識別
- 不複製 proprietary source code
- 不依賴已安裝 MindManager 才能正常編輯
- 不優先做 cloud collaboration
- 不優先做 SaaS / account system
- 不優先做 Microsoft 365 / SharePoint / Planner integration
- 不優先做即時多人協作
- 不在未驗證格式前宣稱 100% `.mmap` compatibility
- 不直接把 AGPL code 混入 permissive-distribution core

---

# 3. Why Not Base the Project on XMind 8

XMind 舊版確實曾公開原始碼，但不建議作為本案基礎。

原因：

1. 技術棧較舊
2. Eclipse/RCP 架構帶來較高維護成本
3. 舊版 source 與今日 XMind Desktop 並非同一個現代產品基線
4. License integration 比 Apache-2.0 / MIT 底座更複雜
5. MindManager compatibility 還是必須另外重做
6. UI/UX 現代化成本偏高

因此 XMind 在本案更適合扮演：

> **Interchange format target**

而不是：

> **Main editor base**

---

# 4. Preferred Technical Baseline

## 4.1 Preferred Base: MindMap Studio

目前優先方案：

```text
MindMap Studio
    │
    ├─ React
    ├─ TypeScript
    ├─ React Flow
    ├─ Canonical Model
    ├─ MMAP importer
    ├─ MMAP writer
    ├─ XMind importer/export support
    ├─ OPML
    ├─ Markdown
    ├─ FreeMind
    └─ local-first storage
```

我們要做的不是從零重寫，而是：

```text
MindMap Studio
      ↓
Compatibility Audit
      ↓
Round-trip Architecture
      ↓
Unknown Preservation Layer
      ↓
MindManager Fidelity Program
      ↓
Production Editor
```

---

## 4.2 Fallback

若 Phase 0 證實 MindMap Studio 架構不適合長期修改：

### Fallback A
React + React Flow + 自有 canonical model

### Fallback B
Mind Elixir Core

Mind Elixir Core 為 MIT license，具有：

- interactive editing
- drag/drop
- multi-select
- undo/redo
- shortcut
- links/arrows
- summary
- theme
- export ecosystem

但若重新採 Mind Elixir，MMAP compatibility layer 仍需自行建立。

---

# 4.3 Project Naming

本專案正式名稱：

```text
Mindloom
```

產品與核心模組命名：

```text
Mindloom
│
├─ Editor
├─ Canvas
├─ Task / Project Tools
│
└─ MapBridge Engine
   ├─ MMAP Adapter
   ├─ XMind Adapter
   ├─ FreeMind Adapter
   ├─ OPML Adapter
   └─ Preservation Engine
```

命名原則：

- **Mindloom**：使用者看到的完整產品名稱。
- **MapBridge Engine**：底層跨格式相容、轉換、驗證與 round-trip 核心。
- **MMAP Compatibility Layer**：MapBridge Engine 內針對 MindManager `.mmap` 的高相容層。
- 未來若新增 CLI，可使用 `mapbridge` 作為命令名稱。
- 公開文案避免將 Mindloom 描述為官方 MindManager 產品或使用容易造成商標混淆的名稱。

建議未來 repository 名稱：

```text
mindloom
```

若拆分核心：

```text
mindloom
mapbridge
```

---

# 5. Architecture

建議最終架構：

```text
┌──────────────────────────────────────────────┐
│                 Application                  │
│                                              │
│   Toolbar / Panels / Search / Commands       │
├──────────────────────────────────────────────┤
│                 Editor Core                  │
│                                              │
│   Canvas / Selection / Drag / Undo / Layout  │
├──────────────────────────────────────────────┤
│              Canonical Map Model             │
│                                              │
│ Topics / Styles / Tasks / Links / Resources  │
├──────────────────────────────────────────────┤
│            Compatibility Metadata            │
│                                              │
│ Origin / Raw XML / Unknown Props / IDs       │
├──────────────┬───────────────┬───────────────┤
│ MMAP Adapter │ XMind Adapter │ Other Adapter │
├──────────────┴───────────────┴───────────────┤
│            Package Preservation              │
│ ZIP / XML / bin / xsd / Preview / extras     │
└──────────────────────────────────────────────┘
```

---

# 6. Core Design Principle: Canonical Model

所有 UI 不應直接操作 MindManager XML。

錯誤方式：

```text
UI
 ↓
Document.xml DOM
 ↓
Save
```

正確方式：

```text
MMAP
 ↓
MMAP Parser
 ↓
Canonical Model
 ↓
Editor
 ↓
Canonical Model
 ↓
MMAP Writer
 ↓
MMAP
```

例如：

```ts
interface MapDocument {
  id: string;
  title?: string;
  rootTopic: Topic;
  floatingTopics: Topic[];
  relationships: Relationship[];
  boundaries: Boundary[];
  resources: ResourceRef[];
  metadata: MapMetadata;

  compatibility: CompatibilityEnvelope;
}
```

---

# 7. Compatibility Envelope

這是本專案最重要的新設計之一。

MindMap Studio 現況的 `.mmap` 支援主要是「解析成自己的 model，再重新生成」。

這適合 interoperability，但不足以追求真正 round-trip fidelity。

應新增：

```ts
interface CompatibilityEnvelope {
  sourceFormat: "mmap" | "xmind" | "native" | "other";
  sourceVersion?: string;

  package?: PreservedPackage;

  unknownDocumentXml?: UnknownXmlStore;

  originalIds?: Record<string, string>;

  unsupportedFeatures: CompatibilityIssue[];

  dirtyDomains: Set<CompatibilityDomain>;
}
```

---

# 8. Preserve Unknown Strategy

## 8.1 核心規則

當 parser 遇到未知內容：

```xml
<mm:SomeFutureFeature Foo="Bar">
    ...
</mm:SomeFutureFeature>
```

若編輯器不認識：

**禁止直接丟掉。**

應保存：

```text
known fields
+
raw unknown XML
+
original ordering hints
+
namespace information
```

---

## 8.2 Preservation Levels

定義四級：

### P0 — Byte Preserve

未被修改的 ZIP entry 原封保存。

例如：

```text
bin/*
xsd/*
Preview.png
custom/*
unknown/*
```

### P1 — XML Subtree Preserve

Document.xml 中未知 subtree 保留。

### P2 — Attribute Preserve

已知 element 上未知 attribute 保留。

### P3 — Semantic Preserve

已知功能解析後，可重新生成等價語意。

---

## 8.3 Dirty-Domain Model

不要每次 Save 都重建整份文件。

追蹤：

```text
topic-tree
notes
tasks
styles
relationships
boundaries
resources
map-metadata
```

例如只修改：

```text
Topic A.title
```

理想 writer 不應無故重寫：

```text
task metadata
style catalog
resource references
unknown extensions
```

---

# 9. MMAP Package Model

先把 `.mmap` 當作 container，而不是單一 XML。

預期常見內容：

```text
example.mmap
│
├─ Document.xml
├─ Preview.png
├─ bin/
│   ├─ ...
│
├─ xsd/
│   ├─ ...
│
└─ other entries
```

注意：

**不得假設所有版本完全一致。**

Parser 必須：

1. 檢查 ZIP validity
2. inventory entries
3. 定位 Document.xml
4. 讀取 namespaces
5. 偵測 schema/version hints
6. 建立 package manifest
7. 保存未知 entries
8. 建立 checksum inventory（測試用途）

---

# 10. Compatibility Test Corpus

沒有 corpus，就無法談 compatibility。

建立：

```text
tests/fixtures/mmap/
```

至少分：

```text
minimal/
topics/
styles/
notes/
markers/
tags/
tasks/
relationships/
boundaries/
callouts/
floating/
images/
attachments/
layouts/
summaries/
hyperlinks/
large/
legacy/
modern/
unknown/
corrupt/
```

---

# 11. Oracle-based Test Generation

若測試機器有合法安裝 MindManager：

建立：

```text
MindManager Oracle Harness
```

Oracle 可以有兩層。

## 11.1 COM Automation Oracle

若目前 MindManager COM API 可用：

```text
Test definition
    ↓
COM
    ↓
MindManager
    ↓
save fixture.mmap
    ↓
MMAP Inspector
```

用途：

- 建 fixture
- 讀 topic tree
- 讀 metadata
- 驗證 save 結果
- 比對行為

---

## 11.2 Manual Oracle

遇到 COM 無法取得的 UI-only 行為：

```text
Test Script
   ↓
Human / REA
   ↓
Observed Behavior
   ↓
Behavior Spec
```

例如：

- drag reparent threshold
- keyboard navigation
- boundary selection behavior
- relationship editing
- style inheritance
- layout recalculation

---

# 12. REA Scope

REA 在本案的任務是：

> **行為觀察與規格建立**

而不是 source extraction。

允許研究：

- 按鍵與結果
- 選取狀態
- Context menu behavior
- Drag-and-drop behavior
- Collapse/expand behavior
- Auto layout behavior
- Style inheritance observable effects
- Task calculation observable effects
- Save 前後檔案變化
- Import/export error behavior
- Unsupported content warnings

每次 REA 任務必須產出：

```text
research/
  REA-XXX-topic-name/
    question.md
    steps.md
    observations.md
    screenshots/
    fixture-before.mmap
    fixture-after.mmap
    conclusion.md
```

---

# 13. Recommended Repository Layout

```text
/
├─ app/
│  ├─ editor/
│  ├─ panels/
│  ├─ commands/
│  └─ shell/
│
├─ src/
│  ├─ model/
│  │  ├─ map.ts
│  │  ├─ topic.ts
│  │  ├─ style.ts
│  │  ├─ task.ts
│  │  └─ compatibility.ts
│  │
│  ├─ formats/
│  │  ├─ mmap/
│  │  │  ├─ package.ts
│  │  │  ├─ parser.ts
│  │  │  ├─ writer.ts
│  │  │  ├─ namespaces.ts
│  │  │  ├─ preserve.ts
│  │  │  ├─ validator.ts
│  │  │  └─ inspector.ts
│  │  │
│  │  ├─ xmind/
│  │  ├─ opml/
│  │  └─ markdown/
│  │
│  ├─ compatibility/
│  │  ├─ report.ts
│  │  ├─ feature-matrix.ts
│  │  └─ diff.ts
│  │
│  └─ oracle/
│     └─ protocol/
│
├─ tools/
│  ├─ mmap-inspect/
│  ├─ mmap-diff/
│  ├─ fixture-builder/
│  └─ oracle/
│
├─ tests/
│  ├─ unit/
│  ├─ roundtrip/
│  ├─ interoperability/
│  ├─ visual/
│  └─ fixtures/
│
├─ research/
├─ docs/
│  ├─ format/
│  ├─ architecture/
│  └─ compatibility/
│
├─ AGENTS.md
├─ MASTER_PLAN.md
└─ README.md
```

實際 fork 後可依原專案目錄調整，不要求為了符合本文件而大量搬動既有檔案。

---

# 14. Feature Support States

每個 MindManager feature 必須使用固定狀態：

```text
UNKNOWN
DISCOVERED
PARSED
DISPLAYED
EDITABLE
WRITABLE
ROUNDTRIP_SAFE
ORACLE_VERIFIED
```

例如：

| Feature | State |
|---|---|
| Topic text | ORACLE_VERIFIED |
| Notes | ROUNDTRIP_SAFE |
| Boundary | WRITABLE |
| Task cost | PARSED |
| SmartRule | DISCOVERED |
| Unknown extension | PRESERVED |

禁止只用：

```text
supported = true/false
```

因為 compatibility 是分層的。

---

# 15. Compatibility Score

每個 fixture 執行：

```text
Load
Save unchanged
Reload
Semantic compare
Package compare
Oracle open test
```

產生：

```text
Structure Score
Text Score
Metadata Score
Style Score
Resource Score
Unknown Preservation Score
MindManager Open Score
```

最後：

```text
Compatibility Score
```

這個分數只供開發趨勢使用，不拿來宣稱官方相容認證。

---

# 16. Three Types of Round-trip Tests

## 16.1 No-op Round-trip

```text
A.mmap
 ↓ load
Our Model
 ↓ save without edit
B.mmap
```

要求：

```text
semantic(A) == semantic(B)
```

且 unknown content preservation 達標。

---

## 16.2 Targeted Edit Round-trip

例如：

```text
A.mmap

修改：
Topic ID X
"Old" → "New"

輸出：
B.mmap
```

期待差異集中於：

```text
X.text
必要 timestamp
必要 checksum
必要 preview
```

不應讓大量 unrelated metadata 消失。

---

## 16.3 Cross-editor Round-trip

```text
MindManager
 ↓
A.mmap
 ↓
Our Editor
 ↓
B.mmap
 ↓
MindManager
 ↓
C.mmap
```

比較：

```text
A → B → C
```

找出 MindManager 自己 normalization 造成的差異，避免誤判。

---

# 17. Required Internal Tools

## 17.1 mmap-inspect

```bash
mmap-inspect file.mmap
```

輸出：

```text
package entries
Document.xml namespace
topic count
relationship count
boundary count
resource count
unknown element count
unknown attribute count
compatibility warnings
```

---

## 17.2 mmap-diff

```bash
mmap-diff before.mmap after.mmap
```

不是單純 XML diff。

需包含：

```text
Package Diff
XML Structural Diff
Canonical Semantic Diff
Resource Diff
Unknown Data Diff
```

---

## 17.3 mmap-normalize

只供測試使用：

```bash
mmap-normalize input.mmap > normalized.json
```

轉成 deterministic semantic representation。

---

## 17.4 compatibility-report

```bash
compatibility-report file.mmap
```

輸出：

```text
Supported
Editable
Read-only preserved
Unknown preserved
Unsupported
Potential loss on save
```

---

# 18. License / Provenance Rules

## 18.1 Allowed Baselines

優先：

- Apache-2.0
- MIT
- BSD
- 其他經核准 permissive licenses

---

## 18.2 AGPL Research Rule

例如第三方 AGPL `.mmap` 工具：

可以：

- 執行
- 驗證
- compare output
- 當 external oracle
- 閱讀公開 file behavior 作格式研究

不可在未經 license decision 前：

- copy implementation
- paste code
- embed library into permissive product
- 改寫幾個變數後納入 core
- 讓 production distribution 形成未審核 AGPL dependency

---

## 18.3 Proprietary Application Research Rule

MindManager 可作：

```text
Black-box Compatibility Oracle
```

Agent 不應：

- 擷取 proprietary source
- 散布 proprietary binaries
- 繞過授權
- 將安裝檔或 DLL 加入 repository
- 將使用者商用檔案加入 public fixtures

---

# 19. Privacy Rule for Fixtures

真實 `.mmap` 可能包含：

- 客戶名稱
- Email
- URL
- 文件附件
- 專案名稱
- metadata
- 本機路徑

所有 public fixture 必須：

```text
Synthetic
或
Sanitized
```

內部 corpus 與 public corpus 必須分開。

---

# 20. Phase Plan

---

# Phase 0 — Baseline / Feasibility / Provenance

## P0A — Fork Audit

Agent 任務：

1. Clone/Fork MindMap Studio
2. 建立 upstream remote
3. 記錄 commit hash
4. 確認 license
5. 確認 dependency licenses
6. 執行：
   - install
   - tests
   - build
   - existing gate
7. 找出：
   - canonical model
   - mmap importer
   - mmap writer
   - xmind adapter
   - React Flow projection
   - persistence layer
8. 不修改核心功能

產出：

```text
docs/audit/P0A_BASELINE_AUDIT.md
```

---

## P0B — MMAP Existing Implementation Audit

完整分析現有：

```text
src/import/mmap.*
src/io/mmap.*
```

或實際對應檔案。

回答：

- parser 支援什麼
- writer 支援什麼
- 什麼會 loss
- unknown XML 是否保留
- unknown ZIP entries 是否保留
- IDs 如何處理
- style 如何處理
- resources 如何處理
- notes 如何處理
- relationships 如何處理
- boundaries 如何處理
- tasks 如何處理
- namespaces 如何處理

產出：

```text
docs/audit/P0B_MMAP_AUDIT.md
```

---

## P0C — License / Dependency Gate

產出：

```text
docs/audit/P0C_LICENSE_PROVENANCE.md
```

必須列：

```text
dependency
version
license
use
distribution impact
approved?
```

---

## P0D — Architecture Decision

正式決定：

```text
A. Fork MindMap Studio
B. Mind Elixir Core
C. React Flow fresh core
```

Decision 必須有證據。

除非有重大 blocker，預設：

```text
A
```

產出 ADR：

```text
docs/architecture/ADR-001-editor-baseline.md
```

---

## Phase 0 Gate

必須全部 PASS：

```text
[ ] clean build
[ ] existing tests pass
[ ] license acceptable
[ ] mmap code located
[ ] canonical model understood
[ ] no architectural blocker
[ ] baseline commit recorded
```

**完成後 STOP。**

未取得下一階段授權前，不進 Phase 1。

---

# Phase 1 — MMAP Corpus & Inspector

## Goal

先理解檔案，再改 writer。

建立：

```text
mmap-inspect
mmap-normalize
fixture corpus
```

---

## P1A — Package Inspector

支援：

```text
ZIP entries
CRC
size
compression
Document.xml detection
namespaces
Preview
bin resources
xsd resources
unknown entries
```

---

## P1B — XML Inventory

列出：

```text
elements
attributes
namespaces
counts
paths
unrecognized structures
```

---

## P1C — Synthetic Corpus

建立 minimal maps：

```text
01-root-only
02-three-level-tree
03-notes
04-links
05-icons
06-tags
07-task
08-image
09-relationship
10-boundary
11-callout
12-floating
13-summary
14-mixed
```

若有 MindManager，可由 MindManager 生成。

---

## P1D — Real Corpus

加入：

```text
legacy samples
modern samples
large map
deep map
wide map
multiple images
attachments
```

必須 sanitize。

---

## Phase 1 Gate

```text
[ ] inspector works without editor
[ ] fixtures reproducible
[ ] no-op baseline captured
[ ] known/unknown feature inventory exists
[ ] corpus provenance recorded
```

---

# Phase 2 — Compatibility Envelope

## Goal

在不大改 UI 的情況下，先讓 model 能攜帶 preservation data。

---

## P2A — Source Package Snapshot

Load `.mmap` 時保存：

```text
entry manifest
untouched resources
raw source metadata
```

---

## P2B — Unknown XML Store

需要研究最佳策略：

### Strategy A
DOM sidecar

### Strategy B
Canonical nodes + raw subtree fragments

### Strategy C
Patch-oriented source tree

Agent 必須做 PoC，不能先假定。

---

## P2C — Stable Identity

必須避免每次 save 重生所有 IDs。

建立：

```text
canonical id
source id
relationship refs
resource refs
```

映射。

---

## P2D — Dirty Tracking

至少：

```text
topic-tree
text
notes
style
task
relationships
boundaries
resources
```

---

## Phase 2 Gate

No-op load/save 必須證明：

- unknown package entries preserved
- unsupported XML 不因 load/save 消失
- original identities 可追蹤
- canonical model regression tests 全過

---

# Phase 3 — MMAP Round-trip Engine

## P3A — Deterministic Parser

要求：

- schema-aware where known
- namespace-safe
- tolerant reader
- no regex XML parsing
- explicit error reporting

---

## P3B — Deterministic Writer

writer 必須：

- stable output
- preserve unknown
- update only necessary domains where practical
- retain package resources
- avoid dangling references

---

## P3C — Semantic Diff

建立：

```text
CanonicalMap A
CanonicalMap B
```

比較：

```text
topic hierarchy
text
note
task
links
markers
style
relations
resources
```

---

## P3D — No-op Corpus

全部 fixture：

```text
open
save
open
compare
```

---

## Phase 3 Gate — First Major Milestone

**核心里程碑：**

```text
MindManager-created A.mmap
          ↓
      Our Editor
          ↓
      Save unchanged
          ↓
       B.mmap
          ↓
MindManager opens successfully
```

至少核心 fixture PASS。

這是整個專案是否值得繼續的第一個重大 Go/No-Go Gate。

---

# Phase 4 — Core Editing Fidelity

## Goal

完成日常使用最重要的 80%。

功能順序：

1. topic text
2. insert sibling
3. insert child
4. delete
5. reorder
6. reparent
7. collapse/expand
8. notes
9. links
10. markers
11. tags
12. basic style
13. undo/redo
14. copy/paste
15. multi-select
16. find

每個功能都必須有：

```text
UI test
model test
save/load test
MMAP roundtrip test
```

---

# Phase 5 — MindManager Visual / Interaction Fidelity

此階段 REA 開始大量介入。

## P5A — Keyboard Model

研究：

- Enter
- Insert
- Tab
- Shift+Tab
- Delete
- F2
- arrows
- Ctrl combinations
- multi-select

不要盲目抄 shortcut 名稱；需確認實際行為與 conflict。

---

## P5B — Drag/Reparent Model

研究：

- drag target
- before/after/in
- visual indicator
- invalid drop
- root behavior
- multi-node drag
- undo

---

## P5C — Selection Model

研究：

- single selection
- multi selection
- canvas selection
- click-away
- context menu
- selection after delete
- keyboard focus

---

## P5D — Layout

至少：

```text
mind map
right-facing
left-facing
org/tree
down
floating topics
manual position
```

---

## P5E — Style Inheritance

建立：

```text
Theme
Map style
Level style
Branch style
Topic override
```

的 precedence specification。

---

# Phase 6 — Structural Objects

依序：

## P6A
Relationship

## P6B
Boundary

## P6C
Callout

## P6D
Summary

## P6E
Floating Topics

## P6F
Images / Attachments

每一種均需：

```text
read
display
edit
write
roundtrip
oracle verify
```

---

# Phase 7 — Task / Project Layer

這一層不要過早做。

MindManager 與一般 mind map 最大的差距之一，就在 task/project semantics。

逐步研究：

- priority
- progress
- start
- due
- duration
- milestone
- resource
- dependency
- roll-up
- parent calculated state
- task filters
- task info display

---

## P7A — Passive Task Preservation

先做到：

```text
看得懂
看得到
不修改時不破壞
```

---

## P7B — Basic Task Editing

支援：

```text
priority
progress
start
due
```

---

## P7C — Calculation Rules

透過 Oracle/REA 研究：

```text
parent roll-up
date roll-up
progress roll-up
dependency effects
```

---

## P7D — Gantt Metadata

第一階段可只：

```text
preserve + inspect
```

不必馬上完整復刻 Gantt UI。

---

# Phase 8 — Interchange

## P8A — XMind

XMind 是 interchange，不是核心。

建立：

```text
XMind
 ↓
Canonical
 ↓
MMAP
```

與：

```text
MMAP
 ↓
Canonical
 ↓
XMind
```

必須產出 capability matrix。

---

## P8B — Other Formats

保留現有：

- Markdown
- OPML
- FreeMind
- Mermaid
- native JSON

但不可讓其他格式需求拖慢 MMAP 核心。

---

# Phase 9 — Desktop Productization

PWA 可繼續保留。

Windows 建議另外評估：

### Option A
Tauri

### Option B
Electron

### Option C
PWA + File System Access API

Windows desktop 版若採 Tauri，可獲得：

- file association
- recent files
- native dialogs
- local file access
- installer
- shell integration

但在 MMAP round-trip 穩定前不要急著換 shell。

---

# Phase 10 — Compatibility Program

## P10A — Version Matrix

例如：

```text
MindManager version
file generation
read
write
roundtrip
known issues
```

---

## P10B — Feature Matrix

產出：

```text
docs/compatibility/MINDMANAGER_COMPATIBILITY_MATRIX.md
```

---

## P10C — Loss Warning UX

使用者打開 `.mmap` 時：

### Safe

```text
This file can be saved with full support for the detected features.
```

### Preserved Read-only

```text
This map contains features that this editor does not edit,
but they will be preserved when possible.
```

### Potential Loss

```text
This map contains unsupported data that may change on save.
Use Save As to preserve the original.
```

任何不確定狀況預設：

```text
Save As
```

不要覆蓋原檔。

---

# Phase 11 — Performance / Reliability

測試：

```text
1,000 topics
5,000 topics
10,000 topics
deep hierarchy
wide hierarchy
many images
large notes
large attachments
hundreds of relationships
```

指標：

- load time
- first render
- edit latency
- save time
- memory
- undo memory
- crash recovery

---

# Phase 12 — Release Readiness

需完成：

- dependency audit
- license notices
- security review
- corrupted file handling
- autosave safety
- backup strategy
- Windows file association
- installer signing strategy
- import warning
- telemetry policy
- privacy policy（若未來有 network feature）
- compatibility documentation
- recovery procedure

---

# 21. Acceptance Levels

---

## Alpha

可以：

```text
open
edit basic topics
save
MindManager reopen
```

---

## Beta

可以日常使用：

```text
notes
markers
tags
links
relationships
boundaries
styles
images
tasks basic
```

且：

```text
unknown preservation
```

可靠。

---

## 1.0

定義為：

> 「MindManager-compatible daily-use editor」

而不是：

> 「100% MindManager clone」

1.0 Gate：

```text
[ ] Core round-trip stable
[ ] Compatibility matrix published
[ ] No known silent data-loss bug in supported scope
[ ] Unsupported features warned
[ ] Original file protection enabled
[ ] Major fixtures pass
[ ] MindManager oracle suite passes defined target
[ ] XMind import/export regression passes
```

---

# 22. Agent Development Rules

所有 Agent 必須遵守。

## Rule 1 — Evidence Before Rewrite

對未知格式：

```text
inspect first
document second
implement third
```

禁止猜 schema。

---

## Rule 2 — Additive First

能 additive 修改時，不直接大重構。

---

## Rule 3 — No Silent Loss

若不能保留：

```text
report it
```

不要假裝成功。

---

## Rule 4 — Original Files Are Read-only by Default During R&D

研究階段：

```text
input.mmap
```

不得直接覆蓋。

一律：

```text
output-*.mmap
```

---

## Rule 5 — Keep Fixtures

每次修正 compatibility bug：

建立 regression fixture。

---

## Rule 6 — Every Compatibility Claim Needs a Test

不得只因：

```text
looks correct
```

就標示 supported。

---

## Rule 7 — Stop on Legal/Provenance Blocker

如發現：

- unclear license
- proprietary code copied into repo
- confidential fixture
- binary redistribution
- local absolute path/private information destined for public repo

立即 STOP，回報 blocker。

---

## Rule 8 — Do Not Optimize Before Round-trip Works

第一優先：

```text
correctness
```

之後才：

```text
performance
UI polish
```

---

# 23. Suggested Branch Strategy

```text
main
develop

feature/p0-baseline
feature/mmap-inspector
feature/mmap-preserve
feature/mmap-roundtrip
feature/mmap-relations
feature/mmap-tasks
...
```

每個 Phase 結束前：

```text
tests
lint
typecheck
build
compatibility regression
```

全部 PASS。

---

# 24. Suggested CI

```text
Install
 ↓
License checks
 ↓
Typecheck
 ↓
Lint
 ↓
Unit tests
 ↓
MMAP fixtures
 ↓
Round-trip tests
 ↓
Semantic diff tests
 ↓
Build
```

真正 MindManager Oracle 不適合一般 public CI 時：

```text
standard CI
+
Windows Oracle Test Rig
```

分開。

---

# 25. Windows Oracle Rig

建議另設：

```text
oracle-machine/
```

需求：

- Windows 11
- 合法 MindManager installation
- automation interface（若可用）
- fixture workspace
- no production/customer data
- deterministic test scripts

Oracle result：

```json
{
  "fixture": "task-basic-01",
  "opened": true,
  "topicCount": 12,
  "warnings": [],
  "verifiedAt": "...",
  "mindManagerVersion": "..."
}
```

---

# 26. Source-of-Truth Documents

專案建立後，至少維護：

```text
MASTER_PLAN.md
AGENTS.md

docs/
  architecture/
    ADR-001-editor-baseline.md
    ADR-002-canonical-model.md
    ADR-003-unknown-preservation.md

  format/
    MMAP_PACKAGE_NOTES.md
    MMAP_XML_NOTES.md
    MMAP_IDENTITY_MODEL.md

  compatibility/
    MINDMANAGER_COMPATIBILITY_MATRIX.md
    KNOWN_LOSS_CASES.md
    VERSION_MATRIX.md

  research/
    REA_INDEX.md
```

---

# 27. Critical Risks

## Risk 1 — MMAP Is More Versioned Than Expected

Mitigation:

- namespaces
- version corpus
- tolerant parser
- raw preservation

---

## Risk 2 — Writer Creates Files MindManager Repairs Silently

MindManager 可能：

```text
open
normalize
save
```

看似成功但資料已改。

Mitigation：

```text
A → Our B → MindManager C
semantic diff
```

---

## Risk 3 — XML Round-trip Looks Correct but References Break

例如：

- relationship target
- resource
- topic link
- icon reference

Mitigation：

建立 reference integrity validator。

---

## Risk 4 — Styles Are Harder Than Topics

Mitigation：

先 preserve，再 edit。

---

## Risk 5 — Task Logic Explodes Scope

Mitigation：

Task 分：

```text
preserve
read
edit
calculate
gantt
```

逐級做。

---

## Risk 6 — Base Project Changes Too Much

Mitigation：

- lock upstream baseline
- keep compatibility code isolated
- periodic upstream merge
- ADR before architectural replacement

---

# 28. First PoC Definition

不要一開始做漂亮 UI。

第一個 PoC：

```text
Input:
  MindManager sample.mmap

Action:
  Open
  Rename one existing topic
  Add one child
  Change one note

Output:
  output.mmap
```

成功條件：

```text
[ ] output opens in MindManager
[ ] original unrelated topics unchanged semantically
[ ] original images survive
[ ] unknown ZIP entries survive
[ ] note update survives
[ ] new child survives
[ ] relationships unrelated to edit survive
[ ] compatibility report generated
```

這個 PoC PASS 後才值得擴大。

---

# 29. Proposed Milestone Sequence

```text
M0  Baseline proven
M1  Inspector
M2  Preserve-unknown architecture
M3  No-op round-trip
M4  Targeted-edit round-trip
M5  Core daily editing
M6  Relationships / boundaries
M7  Styles / visual fidelity
M8  Task basic
M9  XMind interchange
M10 Desktop productization
M11 Beta
M12 1.0
```

---

# 30. Initial Agent Assignment

以下是 Master Plan 建立後，第一個真正交給 Agent 的任務。

---

## TASK: PRE-FLIGHT — Phase 0 Only

你正在開始一個新的 MindManager-compatible editor 專案。

權威計畫：

```text
MINDLOOM_MASTER_PLAN.md
```

本次只執行：

```text
P0A
P0B
P0C
P0D
```

不得進 Phase 1。

### Objectives

1. Audit the current MindMap Studio repository.
2. Confirm exact upstream commit and license.
3. Build and test it without feature changes.
4. Inspect its canonical model architecture.
5. Inspect current `.mmap` importer and writer.
6. Determine exactly what survives or is lost on round-trip.
7. Audit relevant dependency licenses.
8. Decide whether MindMap Studio remains the recommended base.
9. Produce evidence-based reports.
10. STOP after Phase 0.

### Required Outputs

```text
docs/audit/P0A_BASELINE_AUDIT.md
docs/audit/P0B_MMAP_AUDIT.md
docs/audit/P0C_LICENSE_PROVENANCE.md
docs/architecture/ADR-001-editor-baseline.md
```

以及：

```text
phase0-report.md
```

### phase0-report.md must contain

```text
Overall result:
PASS / PASS WITH WARNINGS / BLOCKED

Baseline:
repository
branch
commit
license

Build:
install
test
lint/typecheck
build
existing project gate

MMAP:
import architecture
export architecture
known preserved fields
known lost fields
unknown XML handling
unknown ZIP handling
ID handling
resource handling

Architecture:
canonical model
editor projection
persistence
format adapters

License:
all material dependencies
issues
AGPL exposure
proprietary dependency exposure

Recommendation:
KEEP MINDMAP STUDIO
or
REJECT MINDMAP STUDIO

Blockers:
...

Next recommended step:
Phase 1
```

### Hard Rules

- Do not implement Phase 1.
- Do not redesign the UI.
- Do not rewrite MMAP parser yet.
- Do not copy code from AGPL projects.
- Do not add proprietary MindManager binaries.
- Do not add real customer files to repository.
- Do not claim round-trip compatibility without tests.
- If a legal/provenance blocker appears, STOP.
- If baseline tests fail, document first; do not hide failures with unrelated fixes.

### Exit Condition

Phase 0 is complete only when there is enough evidence to answer:

> **Can we safely and technically use this codebase as the foundation of a high-fidelity MindManager-compatible editor?**

Then STOP and wait for review.

---

# 31. Recommendation

目前建議路線：

```text
MindMap Studio
       ↓
Fork
       ↓
Preservation Layer
       ↓
MMAP Round-trip Engine
       ↓
Compatibility Corpus
       ↓
MindManager Oracle
       ↓
REA Behavior Research
       ↓
Daily-use Compatible Editor
```

而不是：

```text
Old XMind
   ↓
Huge rewrite
   ↓
MMAP support
```

這會把風險集中在真正有價值的地方：

> **相容性，而不是重新發明一套 mind-map editor。**

---

# 32. External References for Initial Audit

Agent 應重新確認，不可把本文件的描述視為永遠有效。

- MindMap Studio  
  https://github.com/dannbleeker/mindmap-studio

- Mind Elixir Core  
  https://github.com/SSShooter/mind-elixir-core

- Historical XMind source mirror / reference  
  https://github.com/juliuskunze/xmind

- mmap-tools — research/reference only; currently AGPL-3.0  
  https://github.com/lifehackjohn/mmap-tools

- mmap-file-viewer — package/format research reference  
  https://github.com/yeshan-jun/mmap-file-viewer

---

# 33. Final Principle

本專案的成功標準不是：

> 「看起來像 MindManager。」

而是：

> **「使用者敢把重要的 `.mmap` 放進來，修改後存回去。」**

因此所有工程優先順序固定為：

```text
Data Safety
    >
Compatibility
    >
Correctness
    >
Workflow Fidelity
    >
Performance
    >
Visual Similarity
```

只要這個順序不被顛倒，專案就能逐步從 PoC 發展成真正可使用的 MindManager-compatible editor。
