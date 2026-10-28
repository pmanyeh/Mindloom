# MindManager Product Parity Matrix

日期：2026-10-28；v2.0 Phase 2 規劃版。MindMap Studio 稽核基準：`c9f802d`。MindManager 執行版本／平台：**UNKNOWN／未觀測**；REAL-001 的 producer metadata 不替代 UI session。本次沒有使用 MindManager 截圖或公開文件推定操作，所有參考行為先保持 UNKNOWN。

Evidence 中 E00–E14 指向 [能力基線的 source／test 索引](MINDMAP_STUDIO_CAPABILITY_BASELINE.md)。目前證據只有 source／tests 與歷史工程稽核；不是跨產品比較。下列目標均是**待觀測後細化的方向**，不是已確認規格或本次實作清單。

## 狀態與優先順序

| Status | 使用條件 |
|---|---|
| UNKNOWN | 參考或現有能力證據不足，不能判斷 |
| OBSERVED | 有具版本、初始狀態、步驟、結果的 MindManager 參考觀測 |
| BASELINE_EXISTS | 本專案已有可追溯 source／tests；不表示 parity |
| PARTIAL | 指明哪部分能力已存在、哪部分未確認；不宣稱參考產品差異已證實 |
| PARITY_TARGET | 觀測後接受為對齊目標，尚未實作 |
| IMPLEMENTED | 已完成對應改動，但尚未完成雙端驗證 |
| VERIFIED | 有指定版本、案例與測試的雙端對照通過；本版無此狀態 |
| DEFERRED | 明確延後，附階段／條件 |
| NOT_PLANNED | 有理由排除；不是因未觀測就排除 |

P0＝資料安全／授權前置；P1＝高頻編輯、選取、焦點、檔案基礎；P2＝結構／內容／版面／命令表面；P3＝進階任務、互通與後續階段。優先順序是候選實作／研究排序，不授權全數研究。先解決首批決策所需問題，其他 UNKNOWN 可保留。

## A. Application shell

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| A | Top command surface | UNKNOWN | Toolbar、command registry、palette | 易找到熟悉的命令群組 | E01 | 參考群組與層級未觀測 | P2 | BASELINE_EXISTS |
| A | Ribbon／toolbar behavior | UNKNOWN | Menus、submenus、快捷鍵提示 | 依觀測對齊展開／停用／focus | E01、E04 | 未確認需要何種 ribbon 表面；不先重寫 | P2 | BASELINE_EXISTS |
| A | Tabs | UNKNOWN | PanelDock 面板 tabs、map selector | 區分面板與文件切換 | E01、E02 | 未確認 document tabs 的需求／目前等價性 | P2 | PARTIAL |
| A | Side panels | UNKNOWN | Notes／Outline／Info／Style 等 dock | 上下文切換與選取同步 | E02 | 參考面板次序／預設／停駐未知 | P2 | BASELINE_EXISTS |
| A | Status bar | UNKNOWN | Canvas 底部狀態／zoom 區 | 適量狀態與可用命令 | E01、E03 | 不假設等同原生 status bar | P2 | BASELINE_EXISTS |
| A | Canvas | UNKNOWN | React Flow pan／zoom、model projection | 保留 renderer、對齊操作 | E03、E09 | 尺度與互動參考未知 | P1 | BASELINE_EXISTS |
| A | File commands | UNKNOWN | Open／native Save／Save As／Export | 清楚區分原生保存與有損匯出 | E12、E14 | MMAP 儲存安全限制仍在 | P0 | BASELINE_EXISTS |
| A | Recent files | UNKNOWN | 本機 library recent／pinned | 快速重開、失敗回饋清楚 | E01、E12 | Recent maps 不等於 OS recent files | P2 | BASELINE_EXISTS |
| A | Zoom | UNKNOWN | Fit、selection fit、百分比／reset、minimap | 依觀測對齊錨點與focus | E03、E04 | 參考步長／操作區未知 | P2 | BASELINE_EXISTS |
| A | View modes | UNKNOWN | Outline、presentation、focus、view-only、board | 模式切換保留使用者狀態 | E01、E10、E11 | 參考模式集合／切換語義未知 | P2 | BASELINE_EXISTS |

## B. Topic editing

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| B | Central topic | UNKNOWN | 單 root；新增 sibling 轉 child | 對齊 root 特例且保護資料 | E00、E03 | 參考 root 操作未知 | P1 | BASELINE_EXISTS |
| B | Main topic | UNKNOWN | root 的 child | 以最小 ops 達成插入位置／focus 規格 | E03 | 參考預設位置／label 未知 | P1 | BASELINE_EXISTS |
| B | Subtopic | UNKNOWN | addChild 尾端新增並展開 | 建立後立即可編輯 | E03、E04 | 參考位置／選取／展開規則未知 | P1 | BASELINE_EXISTS |
| B | Sibling | UNKNOWN | 選取後插入 sibling | 依觀測保持順序／選取 | E03、E04 | 前後插入及 root 特例待查 | P1 | BASELINE_EXISTS |
| B | Floating topic | UNKNOWN | floating tree、新增／detach、canvas 入口 | 不與 callout 混淆 | E03、E07 | 巡覽／落點／parent 規則未知 | P2 | BASELINE_EXISTS |
| B | Text editing | UNKNOWN | contentEditable、rich/plain、blur commit | 編輯／輸入法／提交契約可測試 | E03、E04 | 參考 Enter／Tab／IME 未觀測 | P1 | BASELINE_EXISTS |
| B | Rename | UNKNOWN | F2、雙擊、type-to-edit | 對齊 seed／selection／focus | E03、E04 | 參考初始游標／文字選取未知 | P1 | BASELINE_EXISTS |
| B | Delete | UNKNOWN | 刪除分支／多選，更新相關物件 | 可復原、不遺失非目標資料 | E03、E13 | 刪除後 anchor／DOM focus 未比對 | P1 | BASELINE_EXISTS |
| B | Duplicate | UNKNOWN | branch clipboard／duplicate branch | 複製範圍、ID／選取規則可測試 | E03、E13 | 參考涵蓋物件與位置未知 | P2 | BASELINE_EXISTS |
| B | Reparent | UNKNOWN | pure move／indent／outdent | 保留 tree invariant 與內容 | E03、E06 | 參考 cycle／root／multi 規則未知 | P1 | BASELINE_EXISTS |
| B | Reorder | UNKNOWN | 同層移動、drop before／after、outline drag | 順序與回饋一致 | E03、E06 | 參考命令及插入指示未知 | P1 | BASELINE_EXISTS |

## C. Keyboard workflow（canvas 與編輯中分開）

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| C | Enter | UNKNOWN | Canvas sibling；editor commit+add sibling；root 走 child | 建立／提交／focus 契約 | E03、E04 | 要分 root／child／new／editing 觀測 | P1 | BASELINE_EXISTS |
| C | Shift+Enter | UNKNOWN | Canvas 與 editor Enter 路徑未分 Shift | 依觀測決定修飾鍵語義 | E04 | 不能假定是換行或前置 sibling | P1 | UNKNOWN |
| C | Tab | UNKNOWN | Canvas child；editor commit+add child | 跨狀態結果一致可解釋 | E03、E04 | 選取／focus／Undo 邊界待查 | P1 | BASELINE_EXISTS |
| C | Shift+Tab | UNKNOWN | Canvas outdent；editor 按 Tab 走 child | 先釐清兩種狀態 | E04 | 內部路由不同，不先宣稱哪個錯 | P1 | PARTIAL |
| C | Insert | UNKNOWN | 兩個 key router 未見 binding | 參考確認後才決定是否補綁定 | E04 | 未觀測，不照其他軟體推測 | P1 | UNKNOWN |
| C | Delete | UNKNOWN | Canvas delete／Backspace；editor 文字操作 | 刪除與文字輸入隔離 | E03、E04 | 焦點、範圍及 root 規則待查 | P1 | BASELINE_EXISTS |
| C | F2 | UNKNOWN | rename | 進入編輯後的文字選取／focus | E03、E04 | 參考 selection range 未知 | P1 | BASELINE_EXISTS |
| C | Escape | UNKNOWN | 取消模式；existing edit revert；新主題空白移除／已輸入保留 | 取消不得誤丟文字 | E03、E04、E13 | 參考新／既有狀態尚未比較 | P1 | BASELINE_EXISTS |
| C | Arrow keys | UNKNOWN | Logical parent／first child／siblings；central tree | 逐分支／collapsed／floating 觀測 | E03、E04 | 不能當作視覺方向 parity | P1 | BASELINE_EXISTS |
| C | Ctrl+C | UNKNOWN | Canvas 複製 branch；editor 原生文字 | clipboard 範圍與feedback 明確 | E04、E13 | OS 與內部 clipboard 行為參考未知 | P1 | BASELINE_EXISTS |
| C | Ctrl+X | UNKNOWN | Router 未見 branch cut；文字框可走原生剪下 | 先確認結構／文字兩種意圖 | E04、E13 | 未確認 branch cut，不宣稱全域不存在 | P1 | UNKNOWN |
| C | Ctrl+V | UNKNOWN | Window paste 可處理圖片／文字；內部 branch 為 Ctrl+Shift+V | 依內容型別與狀態決定路徑 | E08、E13 | 瀏覽器權限／參考預期未知 | P1 | PARTIAL |
| C | Ctrl+Z | UNKNOWN | Undo snapshots；editing 時 editor 擁有輸入 | 文字／結構歷史邊界明確 | E04、E13 | commit+create／blur 的一次 Undo 待查 | P1 | BASELINE_EXISTS |
| C | Ctrl+Y | UNKNOWN | Canvas redo；另有 Ctrl+Shift+Z | 恢復內容與必要選取 | E04、E13 | editor 焦點與參考redo 未比對 | P1 | BASELINE_EXISTS |

## D. Selection

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| D | Click | UNKNOWN | 單一 anchor，清 edge／overlay 等 | 單選與 inspector 同步 | E05 | 參考互斥規則未知 | P1 | BASELINE_EXISTS |
| D | Ctrl-click | UNKNOWN | React Flow modified toggle | 多選 anchor 與集合明確 | E05 | 參考 add／toggle 規則未知 | P1 | BASELINE_EXISTS |
| D | Shift-click | UNKNOWN | 同 modified selection 路徑 | 不預設等於 range select | E05 | 參考 range／toggle 未知 | P1 | BASELINE_EXISTS |
| D | Rubber-band | UNKNOWN | Shift-drag 框選 | 命中與平移不衝突 | E05、E06 | 包含／相交模式待實機觀測 | P2 | BASELINE_EXISTS |
| D | Multi-selection | UNKNOWN | selectedIds 與 anchor；bulk inspector | 批次操作不誤改未選物件 | E03、E05 | mixed fields／樹範圍待比對 | P1 | BASELINE_EXISTS |
| D | Parent／child navigation | UNKNOWN | `nextSelectionId` central tree | 展開／折疊／分支方向有規格 | E03、E04 | floating 與視覺左右仍待查 | P1 | PARTIAL |
| D | Selection after create／delete | UNKNOWN | ops selectId、anchor restore | 記錄每次操作後的選取 | E03、E13 | 資料選取不等於 DOM focus | P1 | BASELINE_EXISTS |
| D | Focus after edit | UNKNOWN | Inline／canvas／panel 事件協調 | 輸入不落入錯誤表面 | E03、E04 | 需明確記 active element／caret | P1 | PARTIAL |

## E. Drag/drop

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| E | Sibling placement | UNKNOWN | 命中盒上／下區帶 before／after | 經觀測調整落點與顯示 | E06 | 參考插入區未知 | P1 | BASELINE_EXISTS |
| E | Child placement | UNKNOWN | 中間區帶 child；root 特例 | parent 候選清楚 | E06 | 參考門檻／延遲未知 | P1 | BASELINE_EXISTS |
| E | Reparent | UNKNOWN | tree move 保護 root／自身子孫 | 安全且可 Undo | E03、E06 | 參考展開／focus 規則未知 | P1 | BASELINE_EXISTS |
| E | Reorder | UNKNOWN | Canvas／Outline 都有 before／after | 兩種表面順序語義一致 | E03、E06 | 參考跨左右分支規則未知 | P1 | BASELINE_EXISTS |
| E | Drop zones | UNKNOWN | dragged node 中心命中目標 rect | 可重現區域測試 | E06 | 閾值／重疊優先序需觀測 | P2 | BASELINE_EXISTS |
| E | Insertion indicators | UNKNOWN | child ring／sibling insertion line | 指示與實際操作一致 | E03、E06 | 參考視覺提示未比對 | P2 | BASELINE_EXISTS |
| E | Invalid drop | UNKNOWN | 無有效目標回復 projection；cycle guard | 不變更內容／tree | E03、E06 | 參考回彈／feedback 未知 | P1 | BASELINE_EXISTS |
| E | Multi-selection drag | UNKNOWN | tree selection move／freeform group position | 按模式記錄 maximal branches | E03、E06 | group 與 single 語義待比對 | P2 | PARTIAL |

## F. Structural objects

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| F | Relationship | UNKNOWN | CrossLink、label、arrow、curve、grip、keyboard | endpoint／snap／label workflow | E07 | 參考 snap／路由未知 | P2 | BASELINE_EXISTS |
| F | Boundary | UNKNOWN | nodeIds 邊界、label、style | 覆蓋範圍與巢狀契約 | E07 | 參考 range 不明 | P2 | BASELINE_EXISTS |
| F | Summary | UNKNOWN | 已有 Summary model／括號／label UI | 先觀測產品覆蓋規則 | E00、E07、E14 | MMAP encoding 仍 pending；本次不研究 | P2 | BASELINE_EXISTS |
| F | Callout | UNKNOWN | 主題 anchored annotation／offset／edit | 錨定與選取契約 | E07 | 參考parent／移動規則未知 | P2 | BASELINE_EXISTS |
| F | Floating Topic | UNKNOWN | 獨立 floating tree | 單獨巡覽與移動規則 | E03、E07 | 不能與 callout 合併規格 | P2 | BASELINE_EXISTS |

## G. Topic content

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| G | Notes | UNKNOWN | Notes editor／render、格式工具 | 開啟／編輯／返回 focus | E02、E08 | 參考富文字與保存規則未知 | P2 | BASELINE_EXISTS |
| G | Hyperlinks | UNKNOWN | 主要／額外 link、safe URL、map/node links | 複數連結及開啟模式 | E08、E11 | 參考選取／安全提示未知 | P2 | BASELINE_EXISTS |
| G | Attachments | UNKNOWN | data URL 附件與 UI | 加入／開啟／移除且不丟資料 | E08、E12、E14 | MMAP writer 省略附件；未修復 | P0 | BASELINE_EXISTS |
| G | Images | UNKNOWN | raster／貼上／topic image／尺寸 | 加入與調整的最小流程 | E03、E08 | 參考位置／縮放／裁切未知 | P2 | BASELINE_EXISTS |
| G | Icons／Markers | UNKNOWN | palette／index／bulk markers | 自有資產下的分類與互斥行為 | E02、E08 | 不複製專有 icon；參考分類未知 | P2 | BASELINE_EXISTS |
| G | Tags | UNKNOWN | tag editor／index／bulk／search | 多選與索引保持同步 | E02、E03、E08 | 參考 tag set／互斥未知 | P2 | BASELINE_EXISTS |

## H. Style / Layout

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| H | Topic shape | UNKNOWN | round／rect／幾何 shapes | 選取與調整入口熟悉 | E00、E09 | 參考 shape 範圍未知 | P2 | BASELINE_EXISTS |
| H | Fill | UNKNOWN | flat／tint／gradient／fillImage | 明確的覆寫優先序 | E00、E09 | 參考 precedence 未知 | P2 | BASELINE_EXISTS |
| H | Border | UNKNOWN | per-topic border／outline | 套用與重設可預期 | E09 | 參考線寬／顏色規則未知 | P2 | BASELINE_EXISTS |
| H | Font | UNKNOWN | 字型／size／weight、inline marks | 文字及主題格式分層 | E00、E08、E09 | 參考繼承／選區語義未知 | P2 | BASELINE_EXISTS |
| H | Branch lines | UNKNOWN | branch color／dash、connector styles | 分支與relationship區分 | E00、E09 | 參考 branch 繼承未知 | P2 | BASELINE_EXISTS |
| H | Theme | UNKNOWN | theme／custom theme／Map panel | 最大重用已有引擎 | E09 | 參考 theme 切換／reset 未比對 | P2 | BASELINE_EXISTS |
| H | Map layout | UNKNOWN | 多種 layout、branch override、freeform | 用行為而非名稱比對 | E03、E09 | 參考幾何／方向規則未知 | P2 | BASELINE_EXISTS |
| H | Topic spacing | UNKNOWN | layout／style 幾何參數、尺寸估計 | 以可見擠壓／重疊案例驗收 | E09 | 參考間距與調整命令未知 | P2 | BASELINE_EXISTS |
| H | Auto-layout | UNKNOWN | 由 model 投影布局、動畫、freeform 另路徑 | 拖放後布局結果可重現 | E03、E09 | 參考觸發時機未知 | P2 | BASELINE_EXISTS |
| H | Style inheritance | UNKNOWN | theme／per-node／branch resolve | 先列 precedence 再調整 | E00、E09 | 不宣稱等同 MindManager | P2 | PARTIAL |

## I. Task / Project

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| I | Priority | UNKNOWN | TaskInfo、Info／bulk、1–9 快捷鍵 | 顯示／輸入／marker關係清楚 | E00、E02、E04、E10 | 參考等級及快捷鍵未觀測 | P3 | BASELINE_EXISTS |
| I | Progress | UNKNOWN | 0..1、pie／task toggle、bulk | 步長及唯讀derived結果 | E10 | 參考計算／切換未知 | P3 | BASELINE_EXISTS |
| I | Start date | UNKNOWN | Info 日期／自然語言輸入 | 日期操作與時區安全 | E02、E10 | 參考預設／格式未知 | P3 | BASELINE_EXISTS |
| I | Due date | UNKNOWN | Info、過期／近期判斷 | 清楚回饋並保護日期值 | E02、E10 | 參考工作日／deadline未知 | P3 | BASELINE_EXISTS |
| I | Duration | UNKNOWN | durationDays model／adapter欄位 | 先確認編輯／推導契約 | E00、E10、E14 | 未確認完整 task UI／計算 | P3 | PARTIAL |
| I | Resources | UNKNOWN | resources model／adapter欄位 | 確認欄位與資源管理邊界 | E00、E10、E14 | 欄位存在不等於完整 resource-PM | P3 | PARTIAL |
| I | Dependencies | UNKNOWN | relationship type depends-on | 先分關係標籤與排程引擎 | E00、E07、E10 | 未確認排程 propagation；不先新增 | P3 | UNKNOWN |
| I | Roll-up | UNKNOWN | leaf-task 平均進度；另有跨map roll-up | 分別記錄兩種功能 | E10 | 參考算法未知；不混同 | P3 | BASELINE_EXISTS |
| I | Filters | UNKNOWN | Power Filter 包含日期／完成／priority | 任務查詢與選取一致 | E10、E11 | 參考規則／隱藏或dim未知 | P3 | BASELINE_EXISTS |
| I | Task views | UNKNOWN | Agenda／Kanban／Info | 視圖切換保留資料 | E02、E10 | 參考 views 集合未知 | P3 | BASELINE_EXISTS |
| I | Gantt-related behavior | UNKNOWN | 未在盤點入口找到專用Gantt UI | Phase 8 先確認適用版本／需求 | E00、E01、E10 | 不把日期欄位稱為Gantt | P3 | DEFERRED |

## J. Navigation / productivity

| Area | Feature | MindManager Reference | MindMap Studio Current | Mindloom Target | Evidence | Gap | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| J | Search | UNKNOWN | Find／replace、跨map／note查詢 | 作用域與focus契約 | E01、E11 | 參考命中／替換規則未知 | P2 | BASELINE_EXISTS |
| J | Filter | UNKNOWN | Power Filter、saved filters、dim | 先確認dim／hide／selection互動 | E02、E11 | 參考filter語義未知 | P2 | BASELINE_EXISTS |
| J | Focus | UNKNOWN | focus／isolate／drill／fit | 分清三種視圖操作 | E03、E11 | 參考名稱／返回狀態未知 | P1 | BASELINE_EXISTS |
| J | Collapse／expand | UNKNOWN | 節點／全部／level命令 | 巡覽與可見性一致 | E03、E04 | 參考深度與選取規則未知 | P1 | BASELINE_EXISTS |
| J | Outline | UNKNOWN | editable Outline／drag／selection | 與canvas共享tree | E02、E06、E11 | 參考快捷鍵／selection同步未知 | P2 | BASELINE_EXISTS |
| J | Bookmarks（如適用） | UNKNOWN | saved views、pinned maps、nav history | 先辨識是否為同一產品概念 | E00、E01、E11 | 未確認等同參考bookmark | P3 | UNKNOWN |
| J | Map parts | UNKNOWN | MAP_PARTS builders／插入命令 | 重用templates與subtree操作 | E01、E03、E11 | 參考library／插入位置未知 | P2 | BASELINE_EXISTS |
| J | Shortcuts | UNKNOWN | shortcut sheet與binding map、palette | 單一命令來源與可用性 | E01、E04 | 參考組合鍵需按狀態觀測 | P1 | BASELINE_EXISTS |
| J | Context menus | UNKNOWN | node／pane／edge／overlay／bulk menus | 所選物件與停用命令一致 | E01、E03、E05 | 參考內容／右鍵選取規則未知 | P2 | BASELINE_EXISTS |
| J | Undo／Redo granularity | UNKNOWN | doc snapshots、anchor、600ms keyed coalesce | 一個使用者意圖的交易邊界 | E03、E13 | Enter commit+add、blur、取消需雙端觀測 | P1 | BASELINE_EXISTS |

## 工作規則與下一步

本矩陣是調查地圖，不能用 UNKNOWN 數量逼迫全面研究，也不能將 BASELINE_EXISTS 批次升為 VERIFIED。先採用報告建議的單一「主題建立／提交／取消與焦點」批次，按 [protocol](../research/MINDMANAGER_BEHAVIOR_PROTOCOL.md) 取得足夠的參考後，才形成最小 adaptation 規格。若既有行為已相符，保留實作、補足對照證據即可。
