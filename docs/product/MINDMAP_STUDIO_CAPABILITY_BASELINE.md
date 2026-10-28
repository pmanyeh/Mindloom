# MindMap Studio 能力基線

日期：2026-10-28；稽核基準：`c9f802d07bc7eece0b47b89f4d034934b67f4265`。方法：唯讀 source／test／command／model 盤點，搭配本次完整 gate；**未執行 MindManager，未做瀏覽器視覺驗收**。下文「現行 UX」是由程式事件與既有測試推得的行為，不冒充實機觀測。既有註解的 MindManager-style 字樣不作參考產品證據。

## 分類與證據索引

`KEEP` 保留；`ADAPT` 優先微調既有流程，是否需要調整仍待參考觀測；`EXTEND` 確認差距後再擴充；`REPLACE` 需證明最小調整不可行；`UNKNOWN` 未足以判斷。這些是重用建議，不是本次實作授權。沒有任何區域現在被判定必須 REPLACE。

下列 E 編號供 [對齊矩陣](MINDMANAGER_PARITY_MATRIX.md) 與 [UI map](MINDMANAGER_UI_SURFACE_MAP.md) 引用；每組同時列 source 與相關 tests。測試存在／通過只代表現有系統基線，不代表 MindManager parity。

| 證據 | 實作路徑 | 相關既有測試 |
|---|---|---|
| E00 模型 | [types.ts](../../src/model/types.ts)、[normalize.ts](../../src/model/normalize.ts) | [flow-ops](../../test/flow-ops.test.ts)、[file-roundtrip](../../test/file-roundtrip.test.ts) |
| E01 Shell／commands | [App.tsx](../../src/App.tsx)、[Toolbar.tsx](../../src/components/Toolbar.tsx)、[editorCommands.ts](../../src/components/editorCommands.ts)、[StartScreen.tsx](../../src/components/start/StartScreen.tsx) | [toolbar](../../test/toolbar.test.tsx)、[editor-commands](../../test/editor-commands.test.ts)、[app-integration](../../test/app-integration.test.tsx)、[start-library-sections](../../test/start-library-sections.test.tsx) |
| E02 面板 | [Panels.tsx](../../src/Panels.tsx)、[PanelDock.tsx](../../src/components/PanelDock.tsx)、[usePanels.ts](../../src/hooks/usePanels.ts) | [panels](../../test/panels.test.tsx)、[panel-dock](../../test/panel-dock.test.tsx)、[usePanels](../../test/usePanels.test.ts) |
| E03 主題／tree ops | [ops.ts](../../src/mindmap/flow/ops.ts)、[FlowMindMap.tsx](../../src/mindmap/FlowMindMap.tsx)、[TopicNode.tsx](../../src/mindmap/flow/TopicNode.tsx) | [flow-ops](../../test/flow-ops.test.ts)、[flow-floating](../../test/flow-floating.test.ts)、[flowmindmap](../../test/flowmindmap.test.tsx) |
| E04 鍵盤／編輯 | [keyIntent.ts](../../src/mindmap/flow/keyIntent.ts)、[editorKeys.ts](../../src/mindmap/flow/editorKeys.ts)、[editing.ts](../../src/mindmap/flow/editing.ts)、[shortcuts.ts](../../src/shortcuts.ts) | [flow-key-intent](../../test/flow-key-intent.test.ts)、[editor-keys](../../test/editor-keys.test.ts)、[shortcut-bindings](../../test/shortcut-bindings.test.ts)、[flowmindmap](../../test/flowmindmap.test.tsx) |
| E05 Selection | [FlowMindMap.tsx](../../src/mindmap/FlowMindMap.tsx)、[selectionResolve.ts](../../src/mindmap/flow/selectionResolve.ts)、[selectionInfo.ts](../../src/selectionInfo.ts) | [flow-selection-resolve](../../test/flow-selection-resolve.test.ts)、[selection-info](../../test/selection-info.test.ts)、[flowmindmap](../../test/flowmindmap.test.tsx) |
| E06 Drag／reorder | [dropTarget.ts](../../src/mindmap/flow/dropTarget.ts)、[outline.ts](../../src/outline.ts)、[snap.ts](../../src/mindmap/flow/snap.ts)、[FlowMindMap.tsx](../../src/mindmap/FlowMindMap.tsx) | [drop-target](../../test/drop-target.test.ts)、[flow-snap](../../test/flow-snap.test.ts)、[outline-touch-drag](../../test/outline-touch-drag.test.tsx)、[flow-ops](../../test/flow-ops.test.ts) |
| E07 結構物件 | [CrosslinkEdge.tsx](../../src/mindmap/flow/CrosslinkEdge.tsx)、[Boundaries.tsx](../../src/mindmap/flow/Boundaries.tsx)、[Summaries.tsx](../../src/mindmap/flow/Summaries.tsx)、[Callouts.tsx](../../src/mindmap/flow/Callouts.tsx)、[ops.ts](../../src/mindmap/flow/ops.ts) | [flow-links](../../test/flow-links.test.ts)、[flow-callouts](../../test/flow-callouts.test.ts)、[flow-canvas-overlays](../../test/flow-canvas-overlays.test.tsx)、[overlay-inspector](../../test/overlay-inspector.test.tsx)、[flow-floating](../../test/flow-floating.test.ts) |
| E08 主題內容 | [Panels.tsx](../../src/Panels.tsx)、[noteFormat.ts](../../src/noteFormat.ts)、[attachment.ts](../../src/io/attachment.ts)、[useClipboardImagePaste.ts](../../src/hooks/useClipboardImagePaste.ts)、[icons.ts](../../src/icons.ts) | [panels](../../test/panels.test.tsx)、[noteFormat](../../test/noteFormat.test.ts)、[attachment](../../test/attachment.test.ts)、[use-clipboard-image-paste](../../test/use-clipboard-image-paste.test.tsx) |
| E09 Style／layout | [theme.ts](../../src/mindmap/theme.ts)、[layout.ts](../../src/mindmap/flow/layout.ts)、[style.ts](../../src/mindmap/flow/style.ts)、[ThemeDesignerDialog.tsx](../../src/components/ThemeDesignerDialog.tsx)、[MapPanel.tsx](../../src/components/MapPanel.tsx) | [theme](../../test/theme.test.ts)、[flow-layout](../../test/flow-layout.test.ts)、[flow-shapes](../../test/flow-shapes.test.ts)、[map-panel](../../test/map-panel.test.tsx)、[theme-designer-dialog](../../test/theme-designer-dialog.test.tsx) |
| E10 任務／project | [TaskInfo](../../src/model/types.ts)、[Panels.tsx](../../src/Panels.tsx)、[progress.ts](../../src/progress.ts)、[taskDate.ts](../../src/taskDate.ts)、[agenda.ts](../../src/agenda.ts)、[board.ts](../../src/board.ts)、[rollup.ts](../../src/rollup.ts) | [progress](../../test/progress.test.ts)、[taskDate](../../test/taskDate.test.ts)、[agenda](../../test/agenda.test.ts)、[board](../../test/board.test.ts)、[rollup](../../test/rollup.test.ts) |
| E11 導覽／查詢 | [search.ts](../../src/search.ts)、[filter.ts](../../src/filter.ts)、[outline.ts](../../src/outline.ts)、[savedViews.ts](../../src/savedViews.ts)、[navHistory.ts](../../src/navHistory.ts)、[mapParts.ts](../../src/mapParts.ts) | [search](../../test/search.test.ts)、[filter](../../test/filter.test.ts)、[navHistory](../../test/navHistory.test.ts)、[flowmindmap](../../test/flowmindmap.test.tsx)、[editor-commands](../../test/editor-commands.test.ts) |
| E12 檔案／儲存 | [importDispatch.ts](../../src/io/importDispatch.ts)、[fileSystem.ts](../../src/io/fileSystem.ts)、[useDiskFile.ts](../../src/hooks/useDiskFile.ts)、[mapStore.ts](../../src/store/mapStore.ts)、[useMapExports.ts](../../src/useMapExports.ts) | [import-dispatch](../../test/import-dispatch.test.ts)、[fileSystem](../../test/fileSystem.test.ts)、[use-disk-file](../../test/use-disk-file.test.tsx)、[mapStore](../../test/mapStore.test.ts)、[useMapExports](../../test/useMapExports.test.tsx) |
| E13 History／clipboard | [history.ts](../../src/mindmap/flow/history.ts)、[FlowMindMap.tsx](../../src/mindmap/FlowMindMap.tsx)、[branchClipboard.ts](../../src/store/branchClipboard.ts) | [flow-history](../../test/flow-history.test.ts)、[branch-clipboard](../../test/branch-clipboard.test.ts)、[flowmindmap](../../test/flowmindmap.test.tsx) |
| E14 MMAP | [import/mmap.ts](../../src/import/mmap.ts)、[io/mmap.ts](../../src/io/mmap.ts)、[P0B audit](../audit/P0B_MMAP_AUDIT.md)、[REAL-001 reduced evidence](../../test/fixtures/mmap-corpus/real-public/evidence/REAL-001.json) | [mmap](../../test/mmap.test.ts)、[phase0 loss witnesses](../../test/phase0-mmap-audit.test.ts)、[mmap-real-corpus](../../test/mmap-real-corpus.test.ts) |

## 能力盤點與重用建議

所有列的 MindManager 實際對齊差距目前均為 `UNKNOWN`；下表列出的確定差距是**本專案可確認的能力／觀測邊界**，不是猜測參考產品行為。ADAPT／EXTEND 是未來的最小變更方向，須先有可驗收的參考。

| 領域／實作 | 現行 UX／能力（靜態基線） | 證據 | 已知邊界／待查 parity gap | 建議 |
|---|---|---|---|---|
| Canonical document／純操作／投影 | `MindMapDoc`、tree、floating、links、boundaries、summaries；renderer 讀 model | E00、E03 | 不帶 Compatibility Envelope；不是本次新增理由 | KEEP，保留模型與 UI projection 邊界 |
| Top command／file／recent | 具命令 registry、Toolbar 選單、Start library／recent、palette | E01、E12 | 尚無參考產品分組、停用與鍵盤導覽證據；不是一套待從零建立的 shell | ADAPT，先對照入口與 command availability |
| Tabs／panels | 左 dock 的已開面板 tabs、Info／Notes／Style 等面板；狀態可恢復 | E02 | 面板 tabs 不等於多文件 tabs；MindManager 實際切換模型未知 | KEEP dock 狀態；ADAPT 資訊架構，文件 tabs 暫 UNKNOWN |
| Canvas／status／zoom／view modes | React Flow 畫布、縮放／fit、minimap、view-only、focus／presentation 等入口 | E01、E03、E11 | 底部狀態／zoom 控制已存在；不把它稱為完整原生桌面 status bar | ADAPT 可見命令與上下文，保留 renderer |
| Root／main／subtopic／sibling | `addSibling` 在 root 改走 child；child 加到尾端並展開；一般 sibling 放所選節點之後 | E03 | insertion、空白新增、位置與焦點的參考規則未知 | ADAPT 純 ops／編輯協調，不重寫 tree |
| Inline text／rename | F2／雙擊進入 inline editor；有字元 seed、rich text fallback 與 blur commit | E03、E04 | 輸入法、修飾鍵、取消與焦點需分狀態觀測 | ADAPT 事件路由／焦點，保留 sanitizer 與純操作 |
| Delete／duplicate／reorder | 可刪分支、多選刪除、duplicate、升降層、同層排序；root 有保護 | E03、E13 | 刪除後 anchor／DOM focus 對齊未驗證；reorder 並非缺席 | KEEP 操作；ADAPT 選取／焦點結果 |
| Keyboard | Canvas `keyIntent` 與 inline `handleEditorKeyDown` 分層；表單 guard／Undo／Redo 已有 | E04 | 編輯中路由未分 Shift+Enter／Shift+Tab；Insert 與分支 Ctrl+X 未在此路由找到；這不是已證實的產品 bug | ADAPT，建立狀態矩陣後才改鍵位 |
| Selection | plain click 單一 anchor；Shift／Ctrl／Meta click 由 React Flow 多選回傳；Shift-drag 框選 | E05 | Anchor、selection set、DOM focus 為不同概念；修飾鍵語義與操作後焦點需觀測 | KEEP selection payload；ADAPT 選取契約 |
| Drag／reparent | dragged node 中心命中目標；上／下區帶為前後 sibling，中間為 child；排除自身／子孫 | E06 | 根節點落點、閾值、空間重疊、回彈與 modifier 行為的參考未知 | KEEP 純 hit-test／tree move，ADAPT 判斷參數與回饋 |
| Group drag | 有 multi-selection tree move 與 freeform group position；freeform 跳過單點 guides | E03、E06 | 不能把 freeform 移動與 tree reparent 混成一種行為 | ADAPT，按模式及 maximal branches 分案例 |
| Relationship | 跨連結、標籤、方向／線型／弧度；拖握把與鍵盤連結入口 | E07 | endpoint snap、路由與 label edit 的參考未知 | KEEP model／edge；ADAPT 手勢與命令 |
| Boundary | 已有節點集合、外框及 inline／inspector 操作 | E07 | 可包覆範圍、部分選取與巢狀規則未知 | ADAPT 範圍驗證，保留已有 renderer |
| Summary | 已有 `Summary.nodeIds`、括號繪製、inline label、刪除入口 | E00、E07 | 有產品 UI 不代表 MMAP Summary 可保存；檔案表示仍 pending-format-evidence | ADAPT 未來產品規則；本次不研究或實作 encoding |
| Callout／floating | 已有 anchored callout、相對 offset、inline edit；floating tree／新增與 detach | E03、E07 | Callout 並非一般 floating topic；位置／選取／取消規則未知 | KEEP 既有資料與 ops；ADAPT 操作 |
| Notes | Notes panel 與格式工具、plain fallback／note rendering 已有 | E02、E08 | Rich notes 匯出／MMAP 會有損失，與 UI parity 分別驗證 | KEEP 內容安全處理；ADAPT 面板 workflow |
| Links／attachments／images | 主／額外 link、safe URL、data URL 附件、貼上圖片與文字入口 | E08、E12 | 瀏覽器權限、附件型別、下載／開啟與格式保存是不同層 | KEEP 安全策略；ADAPT 可見操作與失敗回饋 |
| Markers／tags | icon palette、tag、index、bulk tri-state、搜尋入口 | E02、E03、E08 | 現有資產來源不等於可複製 MindManager icon pack；參考分類未知 | KEEP 自有／可用資產及 model；ADAPT 分組 |
| Shape／fill／border／font／lines | per-node style、rich topic、connector、幾何 shape、theme／Map panel | E00、E09 | CSS／theme resolve 的繼承與參考 precedence 未比對 | KEEP theme／style 基礎；ADAPT precedence／入口 |
| Layout／spacing／auto-layout | 已有多種 layout、分支 override、位置估計與動畫、freeform | E03、E09 | 已有功能不能直接稱為 MindManager layout parity | KEEP renderer／layout，ADAPT 經觀測的規則 |
| Priority／progress／dates | Info 欄位、進度 pie、start／due 與自然日期輸入；有 bulk state | E00、E02、E10 | 參考格式、步長與可編輯狀態未知 | KEEP 欄位與日期工具；ADAPT workflow |
| Duration／resources | `TaskInfo.durationDays/resources` 有 model／adapter 欄位 | E00、E10、E14 | 未在已盤點的 task UI 入口確認完整編輯／計算流程；model 欄位存在不等於 UI 完整 | UNKNOWN；若參考需求成立再 EXTEND |
| Roll-up／dependencies／Gantt | `progressMap` 為 leaf-task 加權的平面平均；另有跨 map roll-up；relationship type 有 depends-on | E00、E10 | 兩種 roll-up 不同；depends-on 標籤不等於排程依賴引擎；未找到專用 Gantt UI／critical-path 流程 | KEEP 已有進度／跨 map 功能；排程 UNKNOWN，Phase 8 才判斷 EXTEND |
| Search／filter／focus／outline／saved views | search／Power Filter、collapse／drill、Outline、saved viewport/filter perspectives | E02、E11 | Saved views 與 pinned library map 不直接等於 MindManager bookmarks | KEEP 查詢／導覽資料；ADAPT 操作與可見性 |
| Map parts／context menu／shortcuts | 既有 map parts builders、node／pane／overlay／bulk menu、command palette、shortcut sheet | E01、E03、E04、E11 | 不需從零做；context menu 的選取保持與命令可用性待觀測 | ADAPT 既有入口，避免第二套 command 真相來源 |
| Undo／Redo／persistence | whole-doc snapshots、anchor restore、600ms keyed coalescing、IndexedDB、原生 `.mmst`／JSON、disk save | E03、E12、E13 | 一次 Enter 先 commit 再 add；空白新增取消會回收 snapshot。參考 Undo 邊界／焦點尚未知 | KEEP 歷史基礎；ADAPT 經觀測 transaction 邊界 |
| MMAP／interchange | 已有 import/export dispatch、subset adapters、inspect／normalize、synthetic／real evidence | E12、E14 | 未保留 unknown XML／package，現有 writer 不能宣稱保真；REAL-001 metadata 不是 Oracle | KEEP 研究與限制，Compatibility Hardening 留 Phase 9 |

## 首批決策用的具體邊界

目前最值得先對照的是「主題建立 → 編輯 → 提交／取消 → 選取與焦點」。現有程式已涵蓋大部分路徑，且能以純函式與 integration tests 限定最小改動。尤其：

- `keyIntent` 在 canvas 把 Shift+Tab 當 outdent；inline `editorKeys` 只看 Tab，把所有 Tab 交給新增 child。這是**本專案兩種狀態的差異**，不是已確認 MindManager 要求哪一種。
- Canvas Shift+Enter 目前會經 Enter 分支走 sibling；inline router 也未區分 Shift；Insert 未在這兩個 router 綁定。先觀測，不直接「修正」。
- Escape 對既有主題、新增空白主題、新增已輸入文字的主題有不同結果。任何對齊都要同時保護文字、選取、focus、snapshot 與 autosave。
- Arrow navigation 的 `nextSelectionId` 是 central-tree 的 logical parent／first child／previous／next sibling；不能假設 floating tree、左右分支或視覺位置的巡覽也已相容。

第一批建議詳見 [Phase 2 report](../../phase2-parity-baseline-report.md)。研究只查會影響上述決策的問題；目前不延伸至全面逆向或大規模重寫。
