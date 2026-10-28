# Phase 2 規劃驗證證據

日期：2026-10-28（Asia/Taipei）。驗證範圍是 roadmap v2.0 與產品能力稽核，沒有 UI 實作、MindManager session、Summary 研究或 compatibility implementation。

| 證據 | 含義 |
|---|---|
| [validation.json](validation.json) | 本次環境、命令、範圍、檢查結果與停止條件 |
| [integration.json](integration.json) | main 的精確 accepted ancestry、ff-only、origin push 與成功 CI；不代表規劃分支已 push |
| [static-checks.json](static-checks.json) | 文件連結／範圍／矩陣／source-test 索引／歷史與 production 不變性檢查 |
| [gate.txt](gate.txt) | 實際完整本機 gate：2,573 passed／3 existing skipped、coverage／build／size |
| [install.txt](install.txt) | package.json 固定 pnpm 的 frozen-lockfile 安裝結果 |

main 整合成功 CI：[40622910848](https://github.com/pmanyeh/Mindloom/actions/runs/40622910848)，head `c9f802d07bc7eece0b47b89f4d034934b67f4265`。初次驗收時規劃分支尚未推送；使用者後續已授權 commit 並推送此規劃分支，未授權合併 main 或開始實作。此 main CI 不能當成新版文件提交的遠端 CI；JSON 的 AtValidationTime／AtIntegrationTime 欄位保留當時狀態。

## 可重跑命令

在本次接受基線／規劃分支的 checkout：

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm gate
git diff --check
git diff --exit-code c9f802d -- src test tools scripts .github package.json pnpm-lock.yaml
git diff --exit-code c9f802d -- phase0-report.md phase1-batch1-report.md phase1-batch2-report.md phase1-batch3-report.md phase1-report.md docs/audit
```

文件靜態檢查由 ignored `.tmp/roadmap-v2/check-docs.mjs` 執行：逐一解析新文件的本機 Markdown 連結與 source／test 路徑，檢查存在性；解析矩陣 A–J 的九欄、允許狀態、全部參考 UNKNOWN 與指定十四鍵；檢查 E00–E14；以 git diff 保護原有 reports／audit、source／tests／tooling／configs／dependencies／license；以原始 bytes 比較 v1 snapshot。結果保存在 static-checks.json；helper 沒有加入產品依賴或 production source。

v1 archive 是原始計畫的完整快照，保留原根目錄相對連結與歷史格式，獨立驗證 byte identity，不當成目前的新文件導覽做改寫。此工作不藉修改歷史 whitespace 或連結製造「原件一致」。

## 證據邊界與去識別

新 logs 保留 warning／skip／計數與實際結果，只移除 workspace／profile／hostname、ANSI 色碼並統一換行與尾端空白。原始 logs 留 ignored private 區；不發布原始 log fingerprints。本次沒有重新讀取或處理 REAL-001 原始 package；私人 metadata marker 的檢查沿用先前 ignored 的 marker 清單，公開紀錄只有零命中結果。

本次 gate 一次通過，原有 UI／jsdom 與 build 警告未隱藏、沒有修改 tests 或 thresholds。成功只代表規劃與目前軟體回歸驗證；不代表 MindManager 行為 parity、Oracle 或 MMAP round-trip 通過。
