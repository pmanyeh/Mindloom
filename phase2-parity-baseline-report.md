# Mindloom — Phase 2 Product Parity Baseline 報告

日期：2026-10-28（Asia/Taipei）。本次僅執行文件／稽核／規劃，沒有 UI 實作或實際 MindManager session。

**結果：PASS（僅限文件／稽核／規劃驗收）。** v2.0 路線與產品對齊盤點已建立，靜態檢查與完整 `pnpm gate` 已通過。參考行為保持 UNKNOWN，不把現有 source／tests 當成 MindManager 觀測。Phase 1 的已接受研究基礎被保留，原有 Summary／保真／Oracle 缺口沒有被改寫成通過。

## 已接受工作安全整合

開始時 working tree 乾淨；main 與 origin/main 為 `661c271e40ab4dc7d22391abea7d9db7f48b89cb`。已 fetch origin 並核對精確 parent chain：

```text
661c271e40ab4dc7d22391abea7d9db7f48b89cb
  → 10b66f6e6126daf36dd23cbcbd28a87cd16cfefd
  → c9f802d07bc7eece0b47b89f4d034934b67f4265
```

以 `git merge --ff-only c9f802d...` 整合 main，只推 `origin/main`，沒有 force-push、history rewrite 或 upstream push。整合後的 [main CI](https://github.com/pmanyeh/Mindloom/actions/runs/40622910848) 已 **success**，head 為完整接受的 `c9f802d`，事件是 main push；不是用舊分支／PR 檢查代替整合驗證。GitHub connector 的 commit workflow listing 只涵蓋 PR-triggered runs，因此此 push CI 使用 GitHub CLI 核對。

CI 成功後才由該 head 建立 `feature/roadmap-v2-product-parity`。此分支承載本次規劃變更；本次不另將未審閱的 v2 文件合併 main、不建立 UI 實作分支或部署。遠端 push default 是 origin，upstream push URL 持續 DISABLED。

## 路線調整與歷史證據

新的產品定義是：**以 MindMap Studio 最大重用為基礎，先達成功能／工作流程／互動對齊，再刻意改善為獨立 Mindloom 產品。** Stage A Parity、Stage B Compatibility、Stage C Differentiation 明確分開；安全順位維持 Data Safety > Correctness > Workflow Fidelity > Compatibility > Performance > Visual Polish。

舊的「高保真 MMAP 為頂層主要突破口」不再驅動眼前工作。Compatibility Envelope／Preserve Unknown／safe round-trip 移到 v2 Phase 9；版本／Oracle／互通驗證移到 Phase 10。原 v1 master plan 以接受 head 的原始 bytes 保存在 [v1.0 歷史快照](docs/history/MINDLOOM_MASTER_PLAN_V1.0.md)。Phase 0／1 各報告與既有 `docs/audit/` 完全不改。

Phase 0 COMPLETE 保留原 PASS WITH WARNINGS；Phase 1 FOUNDATION COMPLETE 只代表研究基礎可沿用，不能解讀成舊 Phase 1 所有 gate 都通過。REAL-001／MM-01-minimal 的原件、私人指紋與路徑仍留 private ignored 區，未重新 intake／normalize 或發布原始檔。MindManager 20.1.231／Windows 仍只是文件 metadata。

## 交付物與稽核方法

| 文件 | 內容 |
|---|---|
| [Master Plan v2.0](MINDLOOM_MASTER_PLAN.md) | 三階段產品策略、0–12 路線、歷史移交、安全／授權與停止條件 |
| [Parity Matrix](docs/product/MINDMANAGER_PARITY_MATRIX.md) | A–J 領域，包括全部指定快捷鍵、selection、drag、結構物件、內容、樣式、任務與導覽 |
| [UI Surface Map](docs/product/MINDMANAGER_UI_SURFACE_MAP.md) | 候選產品表面、目的／命令／上下文、現有對等入口與觀測缺口；非參考畫面復刻 |
| [Capability Baseline](docs/product/MINDMAP_STUDIO_CAPABILITY_BASELINE.md) | E00–E14 source／test 索引、現行靜態 UX、KEEP／ADAPT／EXTEND／REPLACE／UNKNOWN 的重用決策 |
| [Behavior Protocol](docs/research/MINDMANAGER_BEHAVIOR_PROTOCOL.md) | 可重用問題／步驟／結果／重複性／版本／平台／confidence 模板、隱私邊界與最小研究停止規則 |
| AGENTS／CLAUDE／README | 與 v2.0 權威、主軌道、Phase 2 僅規劃的授權一致 |
| [Validation evidence](docs/validation/phase2-parity-baseline/validation.json) | 整合 CI、歷史與 production 不變性、文件檢查及 full gate 結果 |

稽核是唯讀程式碼／tests／model／command 盤點。本次沒有執行本專案的瀏覽器視覺驗收，也沒有 MindManager 操作、截圖、COM、REA 實驗或格式逆向；因此 **MindManager Reference 全部為 UNKNOWN**，對齊差距尚不能以視覺／行為差異作結論。對此規劃任務而言，誠實保留未知不構成假通過。

## 主要發現

1. **最大重用可行。** 現有 shell／command registry、dock、tree ops、model、keyboard router、多選／拖放、notes／markers／tags／images、Relationship／Boundary／Summary／Callout／Floating、layout／theme、task fields／progress、search／filter／Outline、Undo／Redo 與原生持久化都有可追溯基礎，沒有證據支持從零重寫或 REPLACE。
2. **功能存在與產品對齊是兩個狀態。** 目前以 BASELINE_EXISTS／PARTIAL 標示本專案存在的能力；不把既有「MindManager-style」註解當觀測，更沒有標記 VERIFIED。
3. **高頻編輯有明確的最小研究切口。** Canvas Shift+Tab 是 outdent，inline router 按 Tab 走 child；Shift+Enter 未在兩路由區分修飾鍵；Escape 依 existing／new／empty／typed 有不同處理。這是已確認的本專案事件契約，不是已知參考產品要怎麼做。
4. **任務能力須分層。** priority／progress／dates 已有 UI，duration/resources 至少有 model／adapter 欄位；leaf-task 進度平均、跨 map roll-up 與 depends-on 關係標籤不等於完整資源／依賴／Gantt 排程引擎。沒有因此在本次加功能。
5. **Summary UI 已存在，MMAP encoding 仍未知。** 產品範圍規則與格式序列化是不同研究；本次沒有啟動兩者。

## 建議的唯一首批實作：P4-B1「主題建立／提交／取消與焦點契約」

**這是待另行授權的條件式建議，本次沒有開始。** 以 Phase 4 的一個小型垂直流程先行，使用既有 shell 入口，不需要先全面重造 Phase 3 shell。若參考與基線一致，就保留行為並補對照／回歸證據，不製造修改。

| 項目 | 建議 |
|---|---|
| Why first | Enter／Tab 建立主題是高頻核心流程，會同時暴露提交、空白取消、選取、focus 與 Undo 問題；既有純操作與 integration tests 可限制改動面 |
| MindManager reference behavior | **UNKNOWN**。尚無合法 session 的版本／平台與可重複結果，不能預先決定快捷鍵映射；先取得下列 Q1／Q3／Q6 的最小觀測 |
| Existing capability | `addChild/addSibling`、`keyIntent`、`handleEditorKeyDown`、inline EditingApi、cancel／discard、selection／anchor、whole-doc history 與 autosave 均存在 |
| Gap | 缺參考狀態契約；canvas／inline modifier 路由不同；selection ID、DOM focus、caret、單次 Undo 尚無雙端對照。不是「缺主題新增功能」 |
| 範圍 | Root／一般主題；selected／editing；existing／new-empty／new-typed；Enter／Tab／F2／Escape／blur；只處理對照後確認的差異 |
| 排除 | Shell／ribbon 重造、所有快捷鍵全面改寫、drag／reparent、結構物件新功能、任務計算、格式保存、Summary 研究、Compatibility Envelope、Preserve Unknown、Oracle harness |
| Expected touched areas | 視差距而定：`src/mindmap/flow/keyIntent.ts`、`editorKeys.ts`、`TopicNode.tsx`、`editing.ts`、`src/mindmap/FlowMindMap.tsx`；只有純操作規則確有差距才動 `ops.ts`；不預設修改 model／adapter |
| Tests required | 既有 editor-keys／flow-key-intent 的狀態／修飾鍵測試；flowmindmap 的 create→edit→commit/cancel／selection／focus／Undo／Redo integration；必要時 DOM focus／caret 與 IME 手動或可自動化案例；原生 JSON／.mmst 與 autosave 資料回歸；完整 `pnpm gate` |
| REA questions required | Protocol Q1（Enter／Tab 的 root／child 與 selected／editing）、Q3（F2／Escape／blur 的 existing／new／empty／typed）、Q6（commit+create／cancel／Undo／Redo）。Q2 只有修飾鍵會影響此批決策時才加；Q4／Q5 作既有行為保護，沒有證據不順便重寫刪除／巡覽 |
| 前置／阻擋 | 需要可合法使用的 MindManager 參考、實際 version/build/platform 與去識別 synthetic 狀態；未取得則保持 UNKNOWN，不宣稱 parity 完成。需要儲存安全改動超出範圍時另行報告 |

建議的批次驗收條件：

- 每個變更都能連到已觀測、可重複的 Given／When／Then；記錄參考版本、平台、初始狀態、精確操作與 scope，沒有來源就不標 VERIFIED。
- 同一案例逐步比對文字、tree／order、selection／anchor、focus／caret、展開狀態與一次 Undo／Redo；root 特例與新空白取消不得留下意外節點或誤丟已輸入文字。
- 表單／Notes／選單／IME 輸入不被 canvas 快捷鍵誤攔；不變更未在批次接受條件內的鍵位。
- 核心 IDs、無關分支／物件、原生儲存與 autosave 資料完整；不以有損 MMAP export 充作資料安全證據。
- 對比前後 source／tests 的最小差距，保留基線能力；完整 gate 通過，且依既有工作規則確認適用 CI。若沒有產品差異，交付證據與測試即可。

## 驗證與停止邊界

本次以 `corepack pnpm install --frozen-lockfile` 使用 package.json 固定的 pnpm 11.0.9；Windows x64、Node 24.19.0。不改 dependencies、lockfile、production source、tests 或 gates。

- 文件靜態檢查通過：93 列矩陣、A–J 十個領域、14 個指定鍵盤項目、E00–E14 source／test 索引與新文件的本機連結。MindManager Reference 全部 UNKNOWN，沒有把規劃標為 OBSERVED／IMPLEMENTED／VERIFIED。
- 歷史 Phase 0／1 報告、既有 `docs/audit/`、production／tests／tools／scripts／CI config／dependencies／lockfile／授權檔案與接受 head 相比完全不變。v1 archive 與接受 head 的原始計畫 bytes 完全一致。
- 完整 `corepack pnpm gate`：**exit 0，223 個測試檔，2,573 passed／3 個既有 skipped（2,576 total）**。Typecheck、Biome、Knip、feature catalogue、coverage、Vite／PWA build、size budget 全部通過；沒有新增 skip 或降低門檻。
- Coverage：statements／lines **90.62%**、branches **87.25%**、functions **78.79%**。First-load JS **182.8 KiB gzip ≤184 KiB**。既有 jsdom focus／print／navigation 與 Vite large-chunk 等警告保留；PowerShell native stderr 包裝不改變實際 exit 0。
- 證據：[驗證摘要](docs/validation/phase2-parity-baseline/validation.json)、[文件檢查](docs/validation/phase2-parity-baseline/static-checks.json)、[完整 gate log](docs/validation/phase2-parity-baseline/gate.txt)、[整合 CI／ancestry](docs/validation/phase2-parity-baseline/integration.json)、[重跑與證據邊界](docs/validation/phase2-parity-baseline/README.md)。新 logs 僅去除本機路徑／hostname、ANSI 並統一換行／尾端空白，所有警告與計數保留；沒有改動歷史 audit。

初次規劃驗收時，此分支尚未 commit／push；使用者後續已明確授權建立交付提交並推送至 `origin/feature/roadmap-v2-product-parity`。確切交付 commit SHA 另於交付訊息提供，不嵌入自身提交。此授權不包含合併 main 或開始實作；接受 Batch 3 整合 main 的成功 CI，不冒充規劃分支的遠端 CI。

| Acceptance Gate | 狀態 |
|---|---|
| Batch 3 接受 head 完整保留於 main | PASS：精確 ancestry、ff-only、origin push |
| main 整合 CI | PASS：40622910848，success |
| Master Plan v2.0／三階段／新產品定義 | 已建立 |
| Product Matrix／Surface Map／Capability Baseline／Behavior Protocol | 已建立，source／test 可追溯；參考 UNKNOWN |
| 歷史 Phase 0／1 與 audit 保留 | PASS：原報告／audit 無 diff，v1 snapshot byte-identical |
| MMAP 支撐軌道／單一首批建議 | 已明列；沒有格式研究或首批實作 |
| production／dependencies／lockfile 不變 | PASS：source／test／tooling／config／license 無 diff |
| 文件／靜態檢查與 full gate | PASS：93 列矩陣；gate exit 0，2,573 passed／3 skipped |

本次驗證已完成，現已**停止供審閱**。後續首批實作、其他 phase、產品發布與相容性實作均需另外明確授權。
