# Maploom Phase 0 報告

日期：2026-10-25（Asia/Taipei）。範圍：主計劃第 20、30 節，僅 P0A–P0D。

**Overall result: PASS WITH WARNINGS**（本機技術基線可用；不代表 MMAP 相容認證或可直接發布）。

**Recommendation: KEEP MINDMAP STUDIO**，採用其編輯器與 canonical model；現有 MMAP adapter 只能視為欄位對映參考，不能直接作為高保真儲存引擎。

## Baseline

| 項目 | 固定值 |
|---|---|
| Repository | https://github.com/dannbleeker/mindmap-studio |
| Upstream branch | `main` |
| Commit | `65964ac06937514cf9805a2b1198cc20f1e83425` |
| Local branch | `feature/p0-baseline` |
| Remote | `upstream`；尚未建立使用者的 GitHub fork 或推送 |
| Software license | Apache-2.0 |
| Book license | CC BY-NC 4.0，另見 `LICENSE-BOOK` |
| Audit environment | Windows x64 / Node 24.22.1 / pnpm 11.0.9 |

原工作區只有本計劃。已在此目錄取得上游 Git 歷史並固定基線，保留計劃書及上游授權文件；`src/`、上游測試、套件清單與 lockfile 均未修改。

## Build

| 檢查 | 結果 |
|---|---|
| `pnpm install --frozen-lockfile` | PASS，530 個安裝實例，無 lockfile 更新 |
| 原始 `pnpm gate` | PASS，exit 0，於新增稽核測試前執行 |
| Typecheck / lint / deadcode / feature catalogue | PASS，均由原始 gate 執行 |
| Existing tests | 219 個檔案；2,484 passed、3 skipped，合計 2,487 |
| Coverage | statements/lines 90.43%、branches 87.05%、functions 78.62%，通過原門檻 |
| Production build / PWA | PASS；僅本機產生 `dist/` |
| Existing size gate | PASS，first-load JS 182.8 KiB gzip ≤ 184 KiB |
| 新增 Phase 0 MMAP 稽核 | 10/10 passed；測試刻意確認上游損失，不能解讀為保真通過 |

3 個略過案例：MMAP 的兩個 `MMAP_FILE` 案例，以及 SimpleMind 的一個外部檔案案例。未提供、搜尋或使用私人地圖。未操作 MindManager，因此所有 MindManager 開檔／修復／回存行為皆 **NOT VERIFIED**。上游 CI 使用 Node 22；本次 Node 24 的 Windows 結果不等同於已驗證所有平台。

## MMAP

- Import：`src/import/mmap.ts`，fflate 解 ZIP，fast-xml-parser 建樹，再對映至 `MindMapDoc`。沒有保存來源 package 或 raw XML。
- Export：`src/io/mmap.ts`，從 canonical model 重建 XML 與 ZIP，只寫 `Document.xml` 及部分 PNG/JPEG 圖片。
- 已有欄位對映測試：topic tree/text、純文字 notes、主要 hyperlink、部分 icons、tags、基本 tasks、floating topics、relationships endpoints、完整 subtree boundaries、左右分支、部分圖片。這些是內部 parser/writer 測試，**不是 MindManager 驗證**。
- 已實測損失：unknown XML/attributes、unknown ZIP entries、preview、XSD entries、附件、topic style、relationship/boundary style、原始 IDs、notes XHTML、日期時間精度、進度小數。Collapsed state 寫出後不讀回。
- IDs：import 採 topic OId，export 對 id 再雜湊；相同 model 可產生相同 bytes，但跨 load/save 循環持續換 ID。
- Resources：已識別圖片/附件轉成 data URL；附件完全沒有 MMAP 寫回路徑，其他二進位項目無保留。
- Unknown ZIP/XML 可在完全沒有 import warning 的情況下遺失；目前不符合計劃的 No Silent Loss。

詳見 [P0B_MMAP_AUDIT.md](docs/audit/P0B_MMAP_AUDIT.md)。

## Architecture

`MindMapDoc` / `MapNode` → 純 React Flow projection → editor 操作 → canonical document。IndexedDB 儲存完整 document，native `.mmst`/JSON 共用序列化；格式 adapter 與 canvas 分離。XMind 等 adapter 已存在。沒有 CompatibilityEnvelope、source package snapshot 或 dirty-domain tracking。

這提供可加掛 preservation layer 的接點；仍須驗證 undo、JSON、IndexedDB 與編輯操作如何攜帶 sidecar，不能假設加上欄位即可完成。

## License

已記錄全部 28 個直接依賴與已安裝 Windows dependency graph 的 523 個 package/version records（31 production-graph、492 development-only）。完整清單與使用／發行影響見 [P0C_LICENSE_PROVENANCE.md](docs/audit/P0C_LICENSE_PROVENANCE.md) 與其證據檔。

- 軟體授權 Apache-2.0；主要 runtime dependencies 為 MIT/ISC。
- JSZip 的選擇授權為 MIT OR GPL，稽核選 MIT；沒有發現 AGPL 必選依賴。
- Lightning CSS 及 Windows native binding 為 MPL-2.0，位於開發工具鏈；不能把所有依賴稱為 permissive，也不能把工具鏈直接打包後假設免除義務。
- caniuse-lite 為 CC-BY-4.0，需要發行時檢查 attribution。
- **預設 `dist/` 包含 CC BY-NC 書籍 PDF/EPUB**，已確認，不能作為已通過商用發布的 Maploom 套件。採用程式碼不包含將書籍改授權的權利。
- 沒有新增 MindManager binaries、AGPL code 或客戶檔案。上游註解提到 bundled XSD，但目前追蹤檔案沒有 XSD；這是上游來源證據缺口，不能引用成已核實的 schema 來源。

## Blockers 與限制

本機 Phase 0 軟體評估無阻止保留基線的 blocker。以下是後續交付的明確限制：

1. 發布前須排除或另取得 CC BY-NC 書籍授權，並檢查打包內容、第三方 notices 與工具鏈授權；目前 `dist/` 不作發布品。
2. 不能安全地以現有 writer 宣稱高保真 MMAP round-trip，必須先建立 preservation 與真實格式證據。
3. 尚無本次 Oracle 證據，也無經授權、可重現的真實 MindManager corpus；不能將 synthetic tests 當成跨編輯器通過。

## 交付與重跑

- [P0A_BASELINE_AUDIT.md](docs/audit/P0A_BASELINE_AUDIT.md)
- [P0B_MMAP_AUDIT.md](docs/audit/P0B_MMAP_AUDIT.md)
- [P0C_LICENSE_PROVENANCE.md](docs/audit/P0C_LICENSE_PROVENANCE.md)
- [ADR-001-editor-baseline.md](docs/architecture/ADR-001-editor-baseline.md)
- [稽核測試](test/phase0-mmap-audit.test.ts) 與 [去除本機資訊的證據](docs/audit/evidence/README.md)

此工作區沒有系統 Node/Pnpm，本次使用 `.tmp/phase0-toolchain/` 的隔離工具鏈，未修改系統 PATH。此機器可直接在 PowerShell 執行：

```powershell
.\tools\phase0\pnpm-local.cmd dev
.\tools\phase0\pnpm-local.cmd gate
.\tools\phase0\pnpm-local.cmd exec vitest run test/phase0-mmap-audit.test.ts
```

其他機器請依上游要求安裝 Node（建議支援的 LTS，至少 22.12）與 pnpm 11.0.9，再執行 `pnpm install --frozen-lockfile`。本機 helper 只使用已存在的稽核工具鏈，不會自行安裝。

**Next recommended step: Phase 1 — MMAP Corpus & Inspector。** 依主計劃要求，本次停在 Phase 0，未實作 Phase 1、未重寫 parser/writer、未改 UI、未部署。先審閱本報告與 ADR，再授權下一階段。

## Repository handoff（Phase 0 後）

使用者於 2026-10-25 建立並授權推送至 `https://github.com/pmanyeh/Mindloom`。
該遠端作為 `origin`，第一版使用 `main`；`upstream` 保留原始來源。此節不改變上方稽核當時的分支與未推送紀錄。

使用者明確要求所有變更不可推至 upstream。已將此規則記錄於 `AGENTS.md`；本機設定 `remote.pushDefault=origin`、`remote.upstream.pushurl=DISABLED`，保留 upstream fetch URL 供唯讀同步。

推送準備只新增 README 導覽，並將部署、書籍重建／寄送、統計回寫三項上游 workflow 限制在 `dannbleeker/mindmap-studio` 執行；一般 CI 保留。未修改應用程式或 MMAP adapter，未授權或執行產品部署。授權文件與上游歷史完整保留。

推送前再次執行完整 `pnpm gate`：exit 0；220 個測試檔、2,494 passed、3 skipped，型別／lint／deadcode／coverage／build／size 全部通過，包含新增的 10 項損失稽核測試。
