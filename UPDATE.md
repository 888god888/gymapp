# v11 更新方式

將壓縮檔解壓，上傳覆蓋到原本 gymapp 專案根目錄。這版必須新增 machines.js，並一起更新 index.html、app.js、styles.css、sw.js、videos.js；原本 data.js、guides.js、media.js、圖示與 manifest.json 也需保留。上傳整份最簡單。

91 個動作中，35 個固定器械、2 個史密斯；首頁預設器械，也可切換全部器材或只看本次新增 20 項。原有收藏與舊網址保留。

新增俯臥腿彎舉與腿推提踵真人短片，總計 20 個動作有頁內影片，其他保留詳細步驟與可用照片。

部署完成後重開 APP，有「新版已準備好」提示時按更新 APP。tests、package.json、package-lock.json 供開發檢查，網站平常執行不需要 npm。
