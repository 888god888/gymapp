# 健身資源庫

適合手機使用的繁體中文動作參考 PWA，直接由 GitHub Pages 提供靜態檔案，不需要後端或 API 金鑰。

## v10 改進（2026-10-29）

- 71 個動作都有完整的器材設定、起始姿勢、動作路徑、幅度界線、回程與安全收尾，另附呼吸、控制節奏、出力感受、錯誤修正和退階方式。
- 加入每組 3 項自我確認、5 階段逐步練習。每次重新開啟動作會清空勾選；勾選不代表姿勢通過檢測。
- 18 個動作有直接嵌入的真人影片（原有 17 個，新增 NASM 腿推）；大多為 14–33 秒的獨立原片，另有 45／88／94 秒示範。只保留官方播放器，不下載、剪輯或重新散布影片。
- 加入慢速、完整循環、重播剛才 10 秒、自選 A/B 起訖與恢復完整原片。自選區段只保存在目前瀏覽器，並標明是使用者設定；沒有把未檢視畫面的時間當成已審核剪輯點。
- 開啟動作就顯示播放器，仍需點擊播放；附加工具失效時可使用原播放器或直接連結。影片受發布者、地區、廣告與網路影響。
- 保留 71 個穩定 ID、舊連結、搜尋、篩選、收藏，離線快取升級至 v10，包含新的教學與播放器程式。
- 靜態照片預設折疊，避免把詳細操作流程推得太遠。

## 內容與媒體來源

- [NASM 官方動作目錄](https://www.nasm.org/resource-center/exercise-library)；影片對照依[官方資料](https://www.nasm.org/documents/exercises.json)及對應動作頁。
- [Catalyst Athletics 高槓深蹲](https://www.catalystathletics.com/exercise/77/Back-Squat/)與[站姿肩推](https://www.catalystathletics.com/exercise/90/Press/)。這些是舉重教學版本，並非所有訓練目的的唯一姿勢。
- [ACE 側平舉](https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/)與[RDL 教學](https://www.acefitness.org/continuing-education/certified/may-2025/8865/the-ace-do-it-better-series-the-romanian-deadlift/)。
- [free-exercise-db](https://github.com/yuhonas/free-exercise-db) 姿勢照片（上游以公有領域發布）。圖片網址固定於 `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`，避免上游變動後無聲換成其他照片。

中文文字是一般教學整理，不能自動判斷使用者的姿勢或疼痛。不同人需要不同的幅度、器材設定與進階方式。仍有 53 個動作沒有直接收錄影片；影片嵌入或圖片的可用性取決於外部服務。影片必須連線觀看，曾瀏覽的照片才可能離線使用。收藏保存在目前瀏覽器，未跨裝置同步。沒有加入個人化處方、熱量或訓練分數等未經驗證的推算。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html`、`styles.css` | 頁面入口與響應式樣式 |
| `data.js` | 71 個動作、穩定 ID、器材分類、操作文字、照片對照與參考來源 |
| `guides.js` | 各動作完整操作、修正與退階方式 |
| `media.js` | 頁內播放器、速度、片段循環與生命週期清理 |
| `videos.js` | 真人影片 ID、發布者、來源與核對日期 |
| `app.js` | 搜尋、篩選、路由、收藏、影片播放和替代畫面 |
| `sw.js` | 版本快取、離線及舊版清理 |

新增影片前應確認動作、器材與姿勢版本相同，再填入 `videos.js` 的物件。不要把 YouTube 搜尋結果標示成已核對的影片。

## 本機檢查

需要 Node.js 20+、Python 3。正式網站不需要安裝任何 npm 套件。

```sh
npm ci
npm test
npx playwright install chromium
python -m http.server 8765 --bind 127.0.0.1
```

瀏覽器測試會自行啟動暫時的本機網站；執行：

```sh
npm run test:browser
```

瀏覽器測試以模擬 YouTube API 檢查片段起訖驗證、循環、速度、恢復完整原片與切頁清理；另涵蓋全部 71 個動作頁、390px 寬度溢出、搜尋／篩選、收藏保留與移除、舊連結、錯誤連結、媒體被封鎖、損壞／不可用儲存、離線文字瀏覽。外部影片的實際播放仍可能受到 YouTube、地區或網路限制；頁面始終保留直接開啟影片的連結。

修改正式資源後，同步增加 `sw.js` 的版本與資源查詢版本，以及 `index.html` 的查詢版本，確保使用者收到同一組檔案。


## 媒體驗證界線

2026-10-29 重新讀取 18 支 YouTube 原頁的影片標題、片長與 `playableInEmbed` 狀態（均回傳允許嵌入）。這只能驗證當時的公開中繼資料，不能保證所有使用者都可播放，也不等於逐幀審核動作。片段循環以播放器提供的實際時間為準，可能受關鍵影格與網路延遲影響。

[YouTube IFrame API 文件](https://developers.google.com/youtube/iframe_api_reference)。影片需連線，離線時仍可使用完整文字教學與操作檢查。
