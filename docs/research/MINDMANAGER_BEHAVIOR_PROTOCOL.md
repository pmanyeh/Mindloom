# MindManager 黑箱行為研究 Protocol

日期：2026-10-28。目的：用最少、可追溯的觀測回答會影響實作決策的產品行為問題。權威範圍見 [Master Plan v2.0](../../MINDLOOM_MASTER_PLAN.md)。本次只建立 protocol，**沒有實際 MindManager session、實驗結果、截圖或自動化 harness**。

## 1. 研究定位與停止準則

REA 主要用於 **product-behavior specification**。不是取得內部實作，也不以全面格式考古為先決條件。採 `observe → implement → compare → refine`；目前僅授權本 protocol／盤點，不授權其中任何實作步驟。

先查 MindMap Studio source／tests，再只研究會改變該批最小 adaptation 的問題。行為、狀態、例外、一次 Undo 的邊界都足以寫成驗收案例時就停止。沒有差異時保留既有功能，不製造修改來湊「已複現」。

一次處理一個有界問題；通常先做兩次相同條件的 trial。有不一致才加一次並找變因；若仍矛盾，標低 confidence／UNKNOWN 並縮小問題，不無限加測或擴充整套產品研究。只有一次觀測時可以記錄，但必須明示 repeatability 未建立，不能標 VERIFIED。

## 2. 合法來源、隱私與研究工具

- 先記錄正常操作該產品的合法可用依據；安裝存在不證明授權。選定實際版本／build／平台／語言，缺資料保持 null／UNKNOWN，不能使用 REAL-001 producer metadata 代填。
- 優先使用刻意建立的 synthetic 地圖：Root、A、A1、B 等中性文字，不開私人／客戶檔。來源檔唯讀；需要輸出時另存私人位置，不覆寫原件。
- 可用正常手動操作、公開文件、合法使用時截圖、受控實驗、accessibility／UI automation、公開 COM／automation 介面；記下使用的是哪種方法及其限制。公開文件須有官方原始連結、適用版本／取用日期；文件描述與實機結果分開標示。
- 不反編譯、不讀取或複製專有程式碼／內部實作，不拷貝 binaries、logo、商標、品牌圖像或受限 icon assets。畫面研究不授權將參考資產加入產品。
- 原始 screenshot／log／package／hash 先留 ignored `.tmp/research/mindmanager/`；公開前審核帳號、名稱、視窗標題、檔案路徑、recent list、通知、metadata、文件與圖片內容。需要遮蔽時保留私人原件並記去識別方法，不任意散布商業產品素材。
- 下面 `research/mindmanager/` 是**經審核後**的文字／合法可公開證據布局建議，不是存私人檔案的預設路徑。本次不新增任何實驗目錄或私人素材。

## 3. 每個實驗的證據布局

```text
research/mindmanager/
  MM-BEH-001-topic-create/
    question.md
    steps.md
    observations.md
    conclusion.md
    screenshots/       # 僅在權限與隱私審查通過後加入
```

保持 ID 穩定；後續修正結論追加版本／原因，不抹除相反結果。每個 trial 與 screenshot 使用中性 ID，公開索引不收原始路徑、使用者名稱、機器名稱或私人 package fingerprints。

## 4. 必填紀錄模板

下列是**空模板，非已執行的 MM-BEH-001**。不將預期答案預填成 Observed result。

```text
Experiment ID: MM-BEH-nnn
Question: 一句會影響實作決策、可被反證的問題
Scope / non-scope: 這筆研究回答到哪裡
Date / timezone:
Operator / evidence custodian: 公開中性ID；私人真實身份另存
Permission / provenance: 合法可用依據與公開權限邊界
MindManager version / build: UNKNOWN，直到由實際產品確認
Platform / OS / locale / input method:
Observation method: manual / official-doc / accessibility / public-automation
Reference document or session: 中性ID；官方文件適用版本／連結／日期
Initial state:
  synthetic tree + order / root / collapsed / layout / selected IDs
  active surface / editing existing-or-new / buffer empty-or-nonempty
  caret or text selection / focused control / menus / panels / filter / view mode
Exact actions:
  依序列每個 key-down／modifier／key-up／click／drag／blur
  拖曳記起點、經過、停留、終點與縮放；不要只寫「拖到下面」
Observed result: UNKNOWN，未執行不得補答案
  content/tree diff / selected object(s) / anchor / focused control / caret
  visibility / expansion / feedback / saved state / undo-redo result
Repeatability: trial IDs、相同條件下的結果、任何偏差與可疑變因
Confidence: UNKNOWN / LOW / MEDIUM / HIGH，附理由與適用邊界
Open questions:
Evidence: trial → 截圖／去識別文字／合法文件對照
MindMap Studio current: source + tests + 相同初始條件（若已執行則記版本）
Gap: UNKNOWN / SAME / DIFF，必須能連回兩端證據
Smallest adaptation candidate: 無實作授權時只建議，不執行
Acceptance case: Given / When / Then + selection/focus/undo/data safety
Publication review: 未通過則只留私人區
```

`Question`、`Initial state`、`Exact actions`、`Observed result`、`Repeatability`、`MindManager version`、`Platform`、`Confidence`、`Open questions` 每個實驗都不可缺。空值或未執行以 UNKNOWN 誠實記錄。

## 5. 操作流程

1. 選定矩陣的一個高價值問題，列出兩種可能答案會如何改變實作；若兩者決策相同，不必研究。
2. 查現有 source／tests／UI 入口，記下可重用能力及已知限制，避免把「沒有證據」當成「沒有功能」。
3. 建立極小 synthetic 狀態；分開記 root／child、existing／new、selected／editing、empty／typed、tree／freeform、IME／非 IME。
4. 執行一組精確操作，先記原始結果，再做解釋。改變一個變因才開下一 trial；不要混合不同版本或捷徑 context。
5. 記內容、階層／順序、selection set、anchor、DOM／應用程式 focus、caret、展開狀態與 Undo／Redo。畫面看起來相同不等於交易邊界相同。
6. 以同初始狀態比較本專案；若本次沒有執行本專案 UI，只記 source／test 推導，不能寫成雙端實機一致。
7. 確認 repeatability／confidence，形成 Given／When／Then；保留例外與未知。足以決策即停。
8. 審核公開證據，更新矩陣 Evidence／Gap／Status 與版本。OBSERVED 不等於已實作；VERIFIED 需雙端對照與對應回歸測試。

## 6. 首批候選問題（未執行）

| 問題ID | 問題與控制狀態 | 影響決策 | 必記結果 |
|---|---|---|---|
| Q1 | Root／一般主題，未編輯與編輯中按 Enter／Tab；分開試新空白／已輸入文字 | 建立意圖、插入位置、commit+create 交易 | tree/order、文字、所選主題、focus、一次 Undo |
| Q2 | Shift+Enter／Shift+Tab／Insert 在上述狀態做什麼 | 是否需要區分修飾鍵／補 binding | 無預期答案；記實際操作與不生效情形 |
| Q3 | F2／double-click 後 caret／selection 如何；Escape／blur 對既有、新空白、新已輸入主題如何 | commit／cancel／discard 契約 | 文字是否保留、selection、focus、snapshot 邊界 |
| Q4 | 刪除唯一 child／中間 sibling／末 sibling／root 後 focus 到哪裡 | selectId 與 active element 是否需分開 | 內容安全、anchor、selection set、鍵盤下一步接收者 |
| Q5 | Arrow 在左右分支、collapsed、leaf、floating tree 如何巡覽 | logical tree 與視覺方向模型 | 前後節點、是否展開、是否繼續編輯 |
| Q6 | 一次 Enter commit+create、接著 Escape、Undo／Redo 各影響什麼 | 最小 transaction／歷史邊界 | 文字、節點、次序、selection／focus、undo depth |

未來再按實作需要選：drag threshold 與 drop zones、invalid／multi-drag、Relationship endpoint snapping、Summary 覆蓋範圍、style precedence、任務 roll-up。**本次不執行這些研究，不做 Summary encoding 差分或 Oracle 檔案相容驗證。**

## 7. 證據強度與結論邊界

單次 screenshot 只能證明某次畫面；既有單元測試只證明本專案程式；文件 producer metadata 只證明文件宣告。實際觀測某個產品鍵盤行為也不等於其檔案可被 Mindloom 安全回存。版本／平台變更時重用結論需先檢查適用性，不一律推廣。對 UI 行為與檔案 Oracle compatibility 分別記錄，避免一種通過被錯用成另一種通過。
