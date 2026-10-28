# Mindloom — Master Plan v2.0

日期：2026-10-28（Asia/Taipei）。本文件是目前的權威產品路線。基礎專案：MindMap Studio（Apache-2.0）；主要平台：Windows，保留跨平台架構；技術：React、TypeScript、React Flow。

## 1. Primary Goal

**在 MindMap Studio 基礎上，先達成與 MindManager 高度一致的主要功能、工作流程及互動體驗，讓既有使用者以極少重新學習成本使用 Mindloom；再有意識地改善體驗、加入 Mindloom 專屬能力，成為獨立產品。**

> Replicate first. Understand where necessary. Improve deliberately.
>
> 先複現成熟做法，必要時研究，確認基線後再刻意改善。

複現是降低產品規劃與試錯成本的開發策略，不是最終品牌定位。高保真 `.mmap` round-trip 仍是重要工程需求，但不再是頂層產品定義或眼前的主要執行軌道。優先重用現有功能，不從零重造編輯器。

## 2. 三個產品階段

| 階段 | 目的 | 範圍與成功依據 |
|---|---|---|
| **Stage A — Parity** | MindManager 使用者能以極少重新學習成本使用 Mindloom | 資訊架構、選單／工具列／類 ribbon 命令表面、面板、主題編輯、鍵盤／滑鼠、拖放、多選、右鍵選單、結構物件、格式／版面、導覽、筆記、標記、標籤、圖片、任務／專案、搜尋／篩選、Undo／Redo、匯入／匯出工作流程；依可追溯觀測案例逐項比對 |
| **Stage B — Compatibility** | 可靠地與 MindManager 生態系交換資料 | `.mmap` 匯入／匯出、安全 round-trip、Compatibility Envelope、Preserve Unknown、package preservation、版本矩陣、Oracle 測試與相容警告；沿用 Phase 0／1 研究 |
| **Stage C — Differentiation** | 成為更好且有自身定位的產品 | 精簡流程、改善 UX、任務整合、AI 製圖、文件／會議轉地圖、語意組織、地圖轉簡報、知識圖譜、更智慧的關係、Automation、Collaboration 等候選；須另行選題、驗證與授權 |

MindManager 在 Stage A 是**可觀察產品行為的參考規格**，不表示已知其全部規格。使用者要求盤點的功能是調查項目，不能直接變成「已觀測參考」。未取得證據一律記 `UNKNOWN`。產品行為對齊不等於檔案序列化相容。

## 3. 工程優先順序與資料安全

```text
Data Safety > Correctness > Workflow Fidelity > Compatibility > Performance > Visual Polish
```

此順序適用於所有階段。對齊 UI 不能授權破壞性檔案操作，不能引入已知資料遺失。沿用 canonical model 與 UI projection 分離，維持 UI、格式 adapter 與儲存的清楚邊界。

- 研發原始檔預設唯讀，另存輸出；私人原件、識別資訊、機器／本機／UNC 路徑與原始指紋不得進公共證據。
- 現有 MMAP reader／writer 有明確損失。工具通過、匯入零警告或 UI 看起來正常都不能證明 round-trip-safe。
- Stage A 若碰到格式無法保存的資料，先界定安全操作、原生格式備份與可測試限制；不能順便進入 preservation 實作或忽略資料損失。
- 儲存安全阻擋某批次時，說明具體依賴並另取範圍授權；開發順序改變不降低安全門檻。

## 4. 「複現」的邊界

複現涵蓋外部可觀察的工作流程、互動、資訊架構、功能行為、鍵盤／滑鼠操作、編輯模型與產品概念。保留 Mindloom 名稱與自主設計資產；不以 pixel-perfect 測量作目前驗收目標。

不複製專有原始碼、內部實作、專有 binaries、logo、品牌圖像、商標或受授權限制的圖示；不反編譯或挪用專有實作。可在合法可用範圍內，透過正常操作、公開文件、合法操作時的截圖、受控實驗、accessibility／UI automation、公開 COM／automation 介面與黑箱 REA 研究行為。來源、權限與隱私須記錄，不將可下載當作可散布。

沿用 Apache-2.0 軟體來源與 upstream `65964ac06937514cf9805a2b1198cc20f1e83425` 的 provenance；保留 `LICENSE`、`LICENSE-BOOK`、`NOTICE.md`。書籍為獨立 CC BY-NC 4.0，預設 build 包含書籍，發布前必須釐清產物範圍。核心不引入專有 binaries 或 AGPL 實作；遇到實際法律／provenance 阻擋時停止。

## 5. 歷史工程基礎與階段重新編號

Phase 0／1 報告及 `docs/audit/` 保持原文、結果與限制，不為迎合新路線改寫。v1.0 計畫保留於 [歷史快照](docs/history/MINDLOOM_MASTER_PLAN_V1.0.md)，內容與接受的 Batch 3 head 完全相同；其舊命令／停止條件屬歷史。快照中的相對連結仍以原根目錄為語境，未為搬移位置改寫內容；目前導覽以本計畫及新盤點文件為準。

| 已接受工作 | 定位 |
|---|---|
| Phase 0 — Foundation / Baseline Audit | **COMPLETE**，原報告仍為 PASS WITH WARNINGS；保留授權、架構與損失稽核 |
| Phase 1 — MMAP Baseline Research | **FOUNDATION COMPLETE（v2 策略里程碑）**：獨立 inspector／normalize、13 份可重現 synthetic package、14 槽 manifest、private intake 與 REAL-001 去識別結構證據可沿用 |
| Phase 1 未完成的驗證 | Summary encoding、較廣 real corpus、真正 writer no-op／round-trip 與 Oracle 仍未驗證；不追認原 v1 所有 gate 通過，後續由 Phase 9／10 按需要接續 |

MindMap Studio 已有 MMAP 匯入／匯出，涵蓋有用的子集。REAL-001 證實真實文件有大量現有 vocabulary 之外的結構。其 MindManager 20.1.231／Windows 是文件內 metadata，並非獨立觀測到的應用程式執行。Unknown preservation 與相容強化仍為未來需求。本次不進行 Summary 差分研究。

舊 **Phase 2 — Compatibility Envelope** 在新路線歸入 **Phase 9 — Compatibility Hardening**；舊報告的「未開始 Phase 2」指當時的 preservation 範圍，不與本次新 Phase 2 的規劃授權混淆。

## 6. v2 執行路線

| Phase | 階段 | 主要輸出／驗收 | 目前授權 |
|---|---|---|---|
| 0 — Foundation / Baseline Audit | Foundation | 已完成基線稽核；保留歷史警告 | 已接受歷史 |
| 1 — MMAP Baseline Research | Foundation | 已完成研究基礎；不足的相容證據明列移交 | 已接受歷史 |
| **2 — Product Parity Baseline** | A | 權威路線、對齊矩陣、UI surface map、現有能力盤點、觀測 protocol、單一首批建議與驗證報告 | **本次僅稽核／規劃** |
| 3 — Application Shell & Command Surface Parity | A | 經觀測的命令資訊架構、選單／工具列、面板、檔案與狀態工作流程 | 未授權 |
| 4 — Core Editing / Keyboard / Selection / Drag Parity | A | 高頻操作、焦點／多選／拖放與 Undo 邊界的可重現案例 | 未授權 |
| 5 — Structural Objects | A | Relationship／Boundary／Summary／Callout／Floating 的產品行為 | 未授權 |
| 6 — Style / Layout / Visual Behavior | A | 主題樣式、繼承、分支、版面與視覺回饋 | 未授權 |
| 7 — Content Features | A | Notes／Links／Images／Markers／Tags／Attachments 工作流程 | 未授權 |
| 8 — Task / Project Workflow | A | 任務欄位、篩選、依賴／roll-up／views 等依證據界定 | 未授權 |
| 9 — Compatibility Hardening | B | Compatibility Envelope、Preserve Unknown、package／XML／ID 安全與 round-trip | 未授權 |
| 10 — Interoperability / Oracle Program | B | 版本／功能矩陣、跨編輯器測試、Oracle 與互通限制 | 未授權 |
| 11 — Mindloom Differentiation | C | 驗證過的獨立產品改善與專屬能力 | 未授權 |
| 12 — Productization / Release | Release | 部署／桌面封裝、效能／可靠性、安全／授權／產物與發布驗收 | 未授權 |

這是工作排序，不是阻擋所有小批次的瀑布式計畫。Phase 2 可建議一個來自 Phase 4 的高頻小批次先行，但須獨立授權並界定跨 Phase 3 的前置條件，不能順便啟動兩個階段或重造 shell。

## 7. 證據與最大重用工作法

```text
MindManager behavior → MindMap Studio existing capability → Gap → Smallest adaptation
```

提出「需要實作 X」前，先查 canonical model、UI 入口、操作函式與既有測試。「MindManager-style」註解、產品宣傳、舊使用手冊與文件 metadata 只能作搜尋線索，不能證明 MindManager 行為。

能力分類：`KEEP` 保留共用基礎；`ADAPT` 視參考行為調整既有流程；`EXTEND` 缺少經確認的小能力時才擴充；`REPLACE` 僅在可證明無法最小調整時提出並列搬遷／回歸成本；`UNKNOWN` 證據不足。現階段沒有證據支持大規模 replace。

對齊狀態：`UNKNOWN`、`OBSERVED`、`BASELINE_EXISTS`、`PARTIAL`、`PARITY_TARGET`、`IMPLEMENTED`、`VERIFIED`、`DEFERRED`、`NOT_PLANNED`。基線存在不等於 parity；OBSERVED 需具版本、初始狀態、步驟及結果的參考證據；VERIFIED 需參考與 Mindloom 兩端對照及測試。狀態與 evidence、confidence、版本綁定，不作「supported=true」式總括宣稱。

## 8. REA 與漸進研究

REA 目前以**產品行為規格**為主，格式研究按必要性接續。高價值問題包括 Enter／Tab 的狀態轉換、刪除後焦點、鍵盤分支巡覽、拖放啟動與命中區、Summary 覆蓋範圍、Relationship 端點吸附與一次 Undo 包含什麼。

> Research only until implementation decisions become sufficiently clear.

採取 `observe → implement → compare → refine`。每批只研究會改變實作決策的問題；足以形成可驗收案例就停止，不先逆向整套產品。無法觀測時明列 UNKNOWN 與條件式建議，不以其他軟體操作習慣填補答案。

依 [行為研究 protocol](docs/research/MINDMANAGER_BEHAVIOR_PROTOCOL.md) 記錄。本次只建立方法與待查問題，沒有實際 MindManager session。Summary 產品行為研究與其 MMAP 編碼研究是不同工作，均未在本次執行。

## 9. Phase 2 交付與驗收

| 交付物 | 角色 |
|---|---|
| [Product Parity Matrix](docs/product/MINDMANAGER_PARITY_MATRIX.md) | A–J 領域逐項盤點，明列參考 UNKNOWN、現有基線、差距與優先順序 |
| [UI Surface Map](docs/product/MINDMANAGER_UI_SURFACE_MAP.md) | 可見表面、目的、命令與上下文；非 pixel-perfect 規格 |
| [MindMap Studio Capability Baseline](docs/product/MINDMAP_STUDIO_CAPABILITY_BASELINE.md) | 路徑／測試／靜態 UX 與重用判斷 |
| [Behavior Protocol](docs/research/MINDMANAGER_BEHAVIOR_PROTOCOL.md) | 可重用的黑箱觀測流程與證據模板 |
| [Phase 2 report](phase2-parity-baseline-report.md) | 接受工作整合、限制、單一首批建議與 gate 結果 |

本次通過條件：接受的 Batch 3 在 main 完整保留且 CI 成功；v2.0 權威與授權一致；盤點可追溯到真實 source／tests；歷史證據不變；提出一個有界定的首批建議；production source／dependencies／lockfile 不變；文件／靜態檢查及 `pnpm gate` 通過。這是**規劃階段驗收**，不是 MindManager 功能對齊驗收。

## 10. 本次授權與停止條件

目前只授權：驗證 `661c271 → 10b66f6 → c9f802d` 精確提交鏈，以 `--ff-only` 將接受的 Batch 3 整合 main、只推 origin 並確認 CI，再於 `feature/roadmap-v2-product-parity` 完成文件／稽核。提交鏈不符就停止，不 rewrite／force-push。

不授權 UI 功能實作、Compatibility Envelope、Preserve Unknown、Summary reverse engineering、production source 重設計、Oracle harness 或後續階段。路線條目與首批建議不構成實作授權。交付報告與驗證後**停止供審閱**，等待明確授權才開始首批實作。

所有 push 只允許 `origin`：`https://github.com/pmanyeh/Mindloom.git`；upstream 只讀，維持 `remote.pushDefault=origin` 與 `remote.upstream.pushurl=DISABLED`。本次規劃分支沒有自動發布／部署／合併後續變更的授權。
