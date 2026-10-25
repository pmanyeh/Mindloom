# Mindloom — Phase 1 Batch 1 report

完成日期：2026-10-26（Asia/Taipei）；實作與測試證據於 2026-10-25 取得。授權範圍：P1A Package Inspector、P1B XML Inventory、initial `mmap-normalize`，僅 Batch 1。

**Overall result: PASS。** Batch 1 已完成；未開始後續批次或 Phase 2。

## Implementation

| 檔案 | 內容 |
|---|---|
| `MINDLOOM_MASTER_PLAN.md` | 由 `MAPLOOM_MASTER_PLAN.md` 改名，工作產品名稱對齊 Mindloom；MapBridge 與原計劃架構保留 |
| `AGENTS.md`, `README.md` | 更新有效計劃入口、Batch 1 授權邊界與工具導覽；upstream 禁止推送規則保留 |
| `src/formats/mmap/zip-directory.ts` | 有界 ZIP32 結構檢查與中央目錄 CRC 宣告值讀取 |
| `src/formats/mmap/inspector.ts` | 獨立 package inventory、Document.xml 選取、分類、診斷、XML 編碼檢查 |
| `src/formats/mmap/knowledge.ts` | 從現有 adapter 證據整理的可擴充 vocabulary；不是 MindManager schema |
| `src/formats/mmap/inventory.ts` | 保留 QName、namespace scope 的 XML 元素／屬性／路徑／宣告計數 |
| `src/formats/mmap/normalize.ts` | 固定格式 deterministic inspection JSON，排除輸入檔名 |
| `tools/mmap-cli.ts` | 不需 React、DOM、IndexedDB、編輯器或 dev server 的 Node CLI |
| `package.json`, `tsconfig.json` | 新增兩個命令；CLI 納入既有 typecheck，依賴及 lockfile 未更動 |
| `test/mmap-inspector.test.ts` | 32 項獨立、結構／namespace／CLI 測試 |
| `test/fixtures/mmap-inspector/synthetic-basic.xml` | 唯一新增的最小 synthetic XML fixture，不是 MindManager 產出 |
| `docs/format/MMAP_INSPECTOR.md` | 操作、分類、normalization、metadata 與格式限制 |
| `docs/audit/phase1-batch1/` | 去除本機資訊的測試／gate 證據、實際 CLI JSON 範例 |

命名對齊限於有效文件與入口；Phase 0 歷史報告、其 evidence 與 `test/phase0-mmap-audit.test.ts` 保留原始名稱與內容。既有上游程式 branding 未作全面改造。

## Commands

```powershell
pnpm mmap-inspect input.mmap
pnpm --silent mmap-normalize input.mmap > normalized.json
pnpm exec vitest run test/mmap-inspector.test.ts test/phase0-mmap-audit.test.ts test/mmap.test.ts
pnpm gate
```

本機仍使用已存在的隔離工具鏈，可用 `.\tools\phase0\pnpm-local.cmd` 取代 `pnpm`。Node 22.12+；腳本使用 `--experimental-strip-types`，不新增 runner 依賴。Node 22 可能在 stderr 顯示實驗功能提醒，stdout 維持 JSON。

不經 pnpm 的直接執行方式：

```powershell
node --experimental-strip-types tools/mmap-cli.ts inspect input.mmap
node --experimental-strip-types tools/mmap-cli.ts normalize input.mmap
```

Exit code：0＝檢查完成，1＝讀取／格式檢查失敗，2＝CLI 用法錯誤。Unknown 不會使有效檢查失敗。測試產生的樣本重現指令見 [工具文件](docs/format/MMAP_INSPECTOR.md#minimal-synthetic-example)。

## Evidence

對同一個 synthetic XML 建立 7-entry 小型測試 ZIP 後，實際輸出摘要如下（完整 JSON 另附）：

```json
{
  "valid": true,
  "entries": 7,
  "document": "Document.xml",
  "documentBytes": 663,
  "namespaceDeclarations": 2,
  "elementGroups": 6,
  "elementOccurrences": 10,
  "attributeGroups": 4,
  "structuralPaths": 8,
  "unknownEntries": ["custom/opaque.dat"],
  "unknownElements": ["f:FutureFeature"],
  "unknownAttributes": ["f:Flag", "f:Mode"]
}
```

上述為實際報告的精簡欄位摘要，完整輸出保留每個 entry 的大小、壓縮方式與 `declaredCrc32`，以及完整 namespace、元素／屬性／路徑計數：

- [synthetic-inspect.json.txt](docs/audit/phase1-batch1/synthetic-inspect.json.txt)
- [synthetic-normalized.json.txt](docs/audit/phase1-batch1/synthetic-normalized.json.txt)

`.json.txt` 是原樣 JSON stdout 的證據檔，未為符合程式碼 formatter 改寫其空白格式。`Preview.png` 等非 XML 項目是刻意的 synthetic 位元組 placeholder；檢查器只盤點 metadata，不聲稱它們是有效圖片／XSD。

已用實際 package script 執行 inspect/normalize，exit code 均為 0；另以 plain Node 子行程驗證 CLI 不需要編輯器啟動。相同檔案重跑、搬移輸入檔名與不同 ZIP entry 排列的 normalization 一致性均有測試。

## Tests

- Focused：3 個測試檔、**97 passed、2 skipped**（99 total）；其中新增 **32/32**，Phase 0 loss witnesses **10/10**，既有 MMAP **55 passed、2 skipped**。
- Focused JUnit：[focused.junit.xml](docs/audit/phase1-batch1/focused.junit.xml)；命令輸出：[focused.txt](docs/audit/phase1-batch1/focused.txt)。
- Full `pnpm gate`：**exit 0；221 個測試檔、2,526 passed、3 skipped（2,529 total）**。Typecheck、Biome、Knip、feature catalogue、coverage、build、size 全部通過。
- Coverage：statements/lines **90.62%**、branches **87.21%**、functions **78.79%**，未調整任何門檻。First-load JS **182.8 KiB gzip ≤ 184 KiB**。
- Full gate 原始輸出：[gate.txt](docs/audit/phase1-batch1/gate.txt)；機器可讀摘要：[validation.json](docs/audit/phase1-batch1/validation.json)。測試環境為 Windows x64／Node 24.22.1／pnpm 11.0.9。
- 3 項略過為原有的兩個 `MMAP_FILE` 與一個 SimpleMind 外部樣本測試，並非新增略過。既有 jsdom focus/print/navigation 與 Vite chunk/dynamic-import 提醒保留於輸出，未以修改 gate 隱藏。

測試涵蓋有效／缺文件／未知 entry／preview／bin／xsd／malformed ZIP、streamed ZIP 的 metadata、不同 prefix/default namespace／局部重綁／屬性 namespace／重複路徑／未知元素與屬性／malformed XML、UTF-16／編碼錯誤、穩定排序與 CLI exit codes。

證據檔只去除本機絕對路徑／hostname、ANSI 色碼並統一換行；錯誤／warning／skip 與測試計數保留。PowerShell 可能把成功命令的 stderr 包裝為 `NativeCommandError` 顯示；程序 exit code 已另行確認為 0。

## Batch 1 acceptance

| 驗收項目 | 結果 |
|---|---|
| Inspector 獨立於 editor、package entries deterministic、Document.xml 偵測 | PASS |
| Namespace、元素／屬性／路徑與重複計數 | PASS |
| Known 與 currently-unrecognized 分類、synthetic unknown ZIP/XML | PASS |
| Normalize deterministic、穩定排序、重跑一致 | PASS |
| Malformed input 的明確診斷與失敗 exit code | PASS |
| Phase 0 損失測試保持原樣、既有回歸仍通過 | PASS |
| 專案完整 gate | PASS |
| 未開始 Phase 2、P1C／P1D 或後續批次 | PASS |

## Limitations

- `package.valid` 是受支援 ZIP32 的結構檢查結果；不是全部 payload、CRC 或 MindManager 開檔認證。CRC 只列中央目錄宣告值，明示未驗證；資源 payload 不解壓。
- ZIP64、多磁碟、加密、重複解碼路徑、部分非標準中央目錄配置尚未支援。上限為 64 MiB package、10,000 entries、16 MiB Document.xml、100 XML nesting levels。未解析的 XML well-formedness 為 null。
- 目錄以尾端 `/` 辨識；legacy 檔名採 fflate 解碼，未完整實作 CP437／本機 codepage。路徑維持觀察到的解碼字串，不改寫或解壓到檔案系統。
- XML 採現有 fast-xml-parser 的 validator 與 ordered parser，加上 namespace scope 檢查；不是 XSD validator 或完整 XML conformance suite。只支援 UTF-8/UTF-16。未盤點 DTD/entity definitions，保留 parser 安全限制。
- 所有 namespace URI 都可盤點；只有 adapter 證據支持的 URI／父子結構才標 known。不同 namespace generation 標 unrecognized，不能推論為無效 MindManager 內容。
- Normalization 是結構證據，不包含一般 text/attribute values，也不是語意等價比較。保留原 QName 與 ZIP metadata 的差異；不生成 timestamp/random ID。
- 沒有真實 MindManager corpus 或 Oracle 驗證。原有損失行為未修復，亦未弱化其測試。
- 依賴沿用 fflate 0.8.3（MIT）、fast-xml-parser 4.5.6（MIT）與 Node 內建工具。**無新依賴、無 lockfile 變更、無 AGPL／專有 binaries／客戶檔案。**

## Phase boundary confirmation

**No Phase 2 preservation behavior was implemented.**

未修改 `src/import/mmap.ts`、`src/io/mmap.ts`、canonical model 或 Phase 0 loss-witness tests。未新增 raw XML sidecar、compatibility envelope、source-ID mapping、stable identity preservation、dirty tracking、writer patch／no-op save、UI warning 或 editor redesign。

未建立 P1C 的 14-case synthetic corpus，未開始 P1D real corpus，未進入 Batch 2、Batch 3 或 Phase 2。完成本報告後停止，交付審閱。所有推送只允許 `origin`（pmanyeh/Mindloom）；upstream push URL 維持 DISABLED。
