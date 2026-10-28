# MindManager UI Surface Map

日期：2026-10-28；Phase 2 規劃版。這是用來組織未來觀測的**候選表面地圖**，不是已觀測的 MindManager 畫面重建。MindManager 各表面的存在形式、名稱、版本差異與行為均為 `UNKNOWN`。目前對等入口依 [MindMap Studio source／test 基線](MINDMAP_STUDIO_CAPABILITY_BASELINE.md) 記錄，沒有實機／pixel-perfect 測量。

```text
Application（候選觀測分區）
├─ Top command area
│  ├─ Command groups / toolbar / ribbon-like surfaces
│  └─ Context-sensitive commands
├─ File workflow
│  ├─ Start / recent / library
│  └─ Open / Save / Save As / Import / Export
├─ Canvas
│  ├─ Topics / text editor / selection / drag feedback
│  └─ Relationship / Boundary / Summary / Callout / Floating
├─ Context menu
├─ Left / right panels
│  ├─ Outline / search / filter / index
│  └─ Notes / content / style / task details
├─ Status / zoom area
├─ Navigation / alternative views
└─ Modal / dialog surfaces
```

## 表面紀錄

「明顯缺口」指這次可確認的資料／對照不足，不將未觀測的參考外觀當成必須改寫的 UX。欄位中的命令是**要調查的意圖**，不是已確認 MindManager 提供的名稱或所在位置。

| Surface | 目的 | 主命令／待查意圖 | 上下文敏感性 | MindMap Studio 現有對等表面 | 明顯缺口 | 觀測狀態 |
|---|---|---|---|---|---|---|
| Top command area | 找到常用操作與目前模式 | 檔案、編輯、插入、格式、檢視、工具 | 無文件／有文件、唯讀、選取物件、編輯中 | Toolbar、分組 menus、command palette；E01 | 參考分組／順序／顯示與停用條件未記錄；不預設一定要重造 ribbon | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Ribbon／toolbar 展開行為 | 在固定空間中發現命令 | 展開、切換群組、鍵盤導覽、收合 | focus、選取、視窗大小 | 既有 Menu／submenu、mobile sheet、shortcut hints；E01、E04 | 參考 contextual tabs／overflow 行為未知 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| File／Start／recent | 開始、切換、找回工作 | New、Open、recent、library、templates | 無文件、文件已開、找不到檔案 | StartScreen、library cards、Recent、map selector；E01、E12 | 本機 maps 與 OS files 的產品概念不可混為一談 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Save／import／export | 保存資料與格式交換 | Save、Save As、Import、Export、Backup／Restore | 已連結原生檔、格式、權限、變更、失敗 | Open／native `.mmst` save、format export menu、backup；E12、E14 | 參考流程未知；現有 MMAP 有損是確定限制，不能用熟悉的按鈕名稱掩飾 | MindManager UNKNOWN；本專案 BASELINE_EXISTS，有已知安全限制 |
| Canvas 的 topic 操作 | 建立與整理想法 | 新增 root／child／sibling／floating、rename、delete、move | root／leaf、collapsed、選取／多選、inline edit、tree／freeform | TopicNode、選取畫布、drag indicators、editable topic；E03–E06 | 缺參考的操作前後 selection、focus、caret 與編輯狀態紀錄 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Canvas 的文字編輯表面 | 專注文字並安全提交／取消 | 輸入、Enter、Tab、Escape、format、blur | existing／new／empty、IME、彈出建議開啟 | Inline rich topic editor、slash／link／tag menus；E03、E04、E08 | 修飾鍵與 IME／選單搶鍵的雙端契約未知 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Canvas 的結構物件 | 表示關係與分組 | 連結端點、加 label、範圍調整、移除 | topic／edge／overlay、單選／多選、編輯中 | Relationships、Boundary、Summary bracket、Callout、floating topic；E07 | 範圍與吸附規則未知；已有 Summary UI 不等於 Summary MMAP 相容 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Context menu | 在目標旁提供有效操作 | 新增、刪除、格式、關係、範圍操作、貼上 | topic／blank pane／relationship／overlay／bulk selection | node／pane／edge／overlay／BulkNodeMenu；E01、E03、E05 | 右鍵是否改變選取、哪些命令消失或停用尚未對照 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Panel dock／tabs | 管理不同工作資訊 | 開／關、切 tab、調整寬度、恢復狀態 | 有無所選物件、開啟面板、窄螢幕 | 左側 tabbed PanelDock、Info panel 與可恢復 panel state；E02 | 參考停駐／浮動／文件 tabs 與面板 tabs 分工未知 | MindManager UNKNOWN；本專案 PARTIAL（僅面板 tabs 已確認） |
| Outline／search／filter／index panels | 不靠畫布也能找與整理資料 | Outline edit／drag、Find、replace、filter、marker/tag index | 搜尋結果、篩選中、collapsed、跨 map | OutlinePanel、Search／Find overlay、FilterPanel、MarkerTagIndex；E02、E06、E11 | 參考是隱藏或 dim、搜尋後 focus／選取如何變化未知 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Notes／content／style／task detail | 編輯所選物件的屬性 | note、links、image、attachments、marker、tag、priority／progress／dates、style | 無選取、單／多選、mixed values、derived progress、edge／overlay | Info／Notes／Styles／Map panels、edge／overlay inspector；E02、E08–E10 | 參考欄位分組／預設面板／唯讀條件未知；duration/resources 不能只憑 model 宣稱完整 UX | MindManager UNKNOWN；本專案 PARTIAL |
| Status／zoom area | 呈現狀態與操控視野 | zoom、fit、reset、minimap、文件／選取提示 | 畫布focus、selection、dirty／save 狀態 | Canvas 底部 controls、toolbar save state、zoom menu；E01、E03、E12 | 參考 status 內容與縮放錨點／步長未知；不預設固定像素尺寸 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |
| Navigation／alternative views | 在同一內容換角度工作 | collapse／expand、focus／drill、Outline、board、agenda、presentation、saved views | 有文件、所選分支、filter／view state | 既有 view commands、nav history、saved views、Agenda／Kanban；E10、E11 | 參考 view 集合／返回狀態未知；Gantt 尚未確認完整對等入口 | MindManager UNKNOWN；本專案 PARTIAL |
| Modal／dialog surfaces | 需要集中決策的多步操作 | New／template、settings、style/theme、import/export 選項、確認 | 權限、錯誤、取消、尚未提交輸入 | SettingsDialog、ThemeDesignerDialog、editor dialogs、輸出對話框；E01、E09、E12 | 預設值、Enter／Escape、取消後回焦、破壞性命令確認需參考 | MindManager UNKNOWN；本專案 BASELINE_EXISTS |

## 首輪觀測邊界

先只觀測 canvas 的「建立／編輯／提交／取消」與 selection／focus；需要哪個入口就記那個入口，不先量測所有 ribbon、panel 或 dialog。對一個可驗收差距，記下畫面位置與命令路徑即可，不做 pixel-perfect 複製。

每筆觀測應能回答：使用者在什麼狀態下看得到／用得到什麼命令？執行後內容、選取、focus 與 Undo 發生什麼變化？對照案例放入 [Behavior Protocol](../research/MINDMANAGER_BEHAVIOR_PROTOCOL.md) 的結構；本文件只連結已審核的去識別證據，不收私人截圖或原始檔。
