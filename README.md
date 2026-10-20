# 健身資源庫

適合手機使用的繁體中文動作參考 PWA，直接由 GitHub Pages 提供靜態檔案，不需要後端或 API 金鑰。

## v9 改進

- 保留 71 個動作與原有 `#chest/0` 等連結，新增以動作 ID 分享的穩定網址。
- 移除自行計算的關節人形與錯誤共用姿勢。不同的握法、站坐姿和器材版本不再以同一套動畫代用。
- 收錄 17 個動作的真人影片：15 支來自 NASM 官方目錄、2 支來自 Catalyst Athletics 的動作頁。來源頁、影片標題及發布者已於 2026-10-20 核對；不是教練逐幀審核或專業認證。
- 其餘動作標示尚無對應影片，提供有來源的姿勢照片或文字步驟。照片標為 A/B，不假設其順序代表起始／完成，也不把靜態照片輪播當成連續動作。
- 重寫或修正 38 個動作的操作要領，包括側平舉倒水提示、臥推路徑、上斜角度、深蹲深度、腿推腳位、髖鉸鏈、腹肌標示與器材轉軸調整。
- 新增中文／英文／肌群／器材搜尋、部位和器材篩選、真人影片篩選、手機本機收藏、內容快速跳轉。
- 圖片載入失敗、錯誤網址、瀏覽器禁止儲存等情況有替代畫面。
- 離線快取採整組版本更新。啟用新版時清理舊 `gym-v8`，預先儲存全部文字資料和介面，避免混用舊 HTML 與新程式。新版有更新提示，收藏不因快取更新而刪除。

## 內容與媒體來源

- [NASM 官方動作目錄](https://www.nasm.org/resource-center/exercise-library)；影片對照依[官方資料](https://www.nasm.org/documents/exercises.json)及對應動作頁。
- [Catalyst Athletics 高槓深蹲](https://www.catalystathletics.com/exercise/77/Back-Squat/)與[站姿肩推](https://www.catalystathletics.com/exercise/90/Press/)。這些是舉重教學版本，並非所有訓練目的的唯一姿勢。
- [ACE 側平舉](https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/)與[RDL 教學](https://www.acefitness.org/continuing-education/certified/may-2025/8865/the-ace-do-it-better-series-the-romanian-deadlift/)。
- [free-exercise-db](https://github.com/yuhonas/free-exercise-db) 姿勢照片（上游以公有領域發布）。圖片網址固定於 `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`，避免上游變動後無聲換成其他照片。

中文文字是一般教學整理，不能自動判斷使用者的姿勢或疼痛。不同人需要不同的幅度、器材設定與進階方式。仍有 54 個動作沒有直接收錄影片；影片嵌入或圖片的可用性取決於外部服務。影片必須連線觀看，曾瀏覽的照片才可能離線使用。收藏保存在目前瀏覽器，未跨裝置同步。沒有加入個人化處方、熱量或訓練分數等未經驗證的推算。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html`、`styles.css` | 頁面入口與響應式樣式 |
| `data.js` | 71 個動作、穩定 ID、器材分類、操作文字、照片對照與參考來源 |
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

瀏覽器測試涵蓋全部 71 個動作頁、390px 寬度溢出、搜尋／篩選、收藏保留與移除、舊連結、錯誤連結、媒體被封鎖、損壞／不可用儲存、離線文字瀏覽。外部影片的實際播放仍可能受到 YouTube、地區或網路限制；頁面始終保留直接開啟影片的連結。

修改正式資源後，同步增加 `sw.js` 的版本與資源查詢版本，以及 `index.html` 的查詢版本，確保使用者收到同一組檔案。
