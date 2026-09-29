# 圖片載入踩坑紀錄與解決方案（fast.webp）

**紀錄日期：** 2026-09-28  
**適用範圍：** 靈感搶救戰 GitHub Pages 版

## 事件：遊戲圖片首次載入偏慢

### 使用者觀察

GitHub Pages 首次開啟時，開始畫面的圖例、背景與遊戲道具圖片需要等待，體感與寶寶月餅遊戲相同。

### 原因分析

本遊戲原本同時使用多張 PNG 與較大的 WebP 素材；其中部分透明插畫約 1–1.7 MB。圖片需要先經過網路傳輸與瀏覽器解碼，Canvas 或 HTML 才能繪製。冷快取、手機網路與裝置解碼速度會讓等待更明顯。

這次先採用寶寶月餅遊戲 `LESSONS_LEARNED.md` 的已知解法。未使用 Network 面板測量真實手機冷快取秒數，因此本紀錄不宣稱特定載入秒數改善。

## 修正內容

1. 將遊戲實際引用的圖片轉成同尺寸 `*-fast.webp`，品質設定為 WebP quality 82。
2. 將 HTML、CSS、JavaScript 的引用全部切換到 `*-fast.webp`，維持相對路徑與大小寫一致。
3. 保留原始 PNG/WebP 素材，方便日後重新壓縮或比較，不直接刪除原檔。
4. 版本化 `game.js` query string 為 `v=7.4.5`，避免瀏覽器繼續使用舊版 JavaScript 快取。
5. 新增遊戲底部署名：`Developed by 魏今秀 Jean Wei｜高雄榮民總醫院 教學研究部`。

## 驗證結果

- 所有程式引用的 `*-fast.webp` 檔案均存在於 `assets/`。
- 已檢查 HTML、CSS、JavaScript，未保留被替換的遊戲圖片引用。
- fast.webp 仍保留透明圖片內容，並維持原始像素尺寸。
- 待驗證：真實手機在 GitHub Pages 冷快取、暖快取與慢速行動網路下的實際載入時間與畫質。

## 後續測試清單

- [ ] 使用瀏覽器 Network 的 Disable cache 測 GitHub Pages 冷快取。
- [ ] 用一般快取再測一次暖快取。
- [ ] 至少以一台手機檢查開始畫面、橫式背景、直式背景、道具圖與擊打槌圖片是否清楚。
- [ ] 若仍覺得慢，再依首屏實際需要延後載入非首屏素材；不可只看本機或暖快取結果。

## 2026-09-28：道具與名句補字母平衡調整

- 名句詞庫目前為 50 句，每局隨機抽 1 句；新增句子依 Project Gutenberg 的 Poor Richard 格言段落補入，並各自補上繁體中文解讀。
- 遊戲最後 33%（剩餘 20 秒）且字母尚未集滿、同仁道具尚未收取時，同仁一起討論的優先生成間隔由 4 波縮短為 2 波。
- 臨床急件每個紅標的機率為 10%。一般特殊道具判定仍為 20%；其中慢速懷錶占 50%，換算為每次符合一般特殊道具抽選條件時 10%，與臨床急件的 10% 對齊。
- 慢速懷錶的效果仍是生成間隔放慢 3 秒，沒有改成直接增加回合秒數。


## 2026-09-28：節奏、連續名句與音效調整

- 開局前 5 秒每波最多生成 1 個靈感與 1 個紅標，之後恢復原本數量。
- 名句完成後保留完成歷史，立即切換下一句；目前收集字母與紅標扣字母都只針對目前句子。
- 紅標音效提高音量；星光靈感與同仁一起討論改用不同音色。
- 已通過 Node.js 語法檢查；尚未以真實手機逐項聽取三種音效，音量仍需實機確認。

## 2026-09-28：替換槌子兩種狀態圖片

- 使用者新增 assets/槌子_預設.png 與 assets/槌子_打下去.png。
- 轉成 idea-mallet-ready-fast.webp 與 idea-mallet-strike-fast.webp 後，分別套用到待擊與按下擊打狀態。
- 原始 PNG 保留；線上介面使用 fast.webp 版本。

## 2026-09-28：更新 OG 圖與暫停任意門回連

- OG 分享圖改用 assets/og-image.jpg（1200 × 630），index.html 的 Open Graph 與 Twitter 分享圖都指向 GitHub Pages 的絕對網址。
- 頁面底部任意門超連結已暫時移除；預計 2026 年 10 月底再評估是否恢復，屆時需一併確認網址與按鈕素材。

## 2026-09-29：提高同仁道具協助頻率

- 名句完成後會立即切換下一句；50 句詞庫用完後仍可繼續隨機抽取，因此沒有固定的名句句數上限，實際句數受回合時間與加時影響。
- 同仁一起討論不再限制每句只能出現一次：同一句名句尚未完成時，前 40 秒約每 3 波重新提供一次，最後 20 秒縮短為每 2 波。
- 每次同仁道具收取時，仍由 `nextMissingQuoteLetter()` 依目前名句的剩餘字母計算，避免補到前一句或下一句的字母。

## 2026-09-29：移除遊戲桌面狀態徽章

- 依畫面需求移除遊戲桌面上方的「準備開始／準備中／搶救中／本局完成」狀態徽章，保留下方的「開始搶救」操作按鈕。
## 2026-09-29：HUD 狀態卡片文字置中

- 將剩餘時間、搶救到的靈感、連續接住三張 HUD 卡片的標題與數字統一水平置中，並保留手機版響應式尺寸。
## 2026-09-29：圖片載入效能實測與 fast → hi-res 分層載入

### 量測範圍與基線

本次以 GitHub Pages 線上網址 `https://weichinhiou.github.io/inspiration-rescue-game/` 實測，並以目前工作區 `index.html`、`styles.css`、`game.js` 與 `assets/` 做引用盤點。量測不包含既有未追蹤且未被程式引用的素材：`QR.png`、`QR2.png`、`circle.png`、`inspiration-rescue-square-rounded.png`、`squre.png`；這些檔案保留在工作區，沒有納入本次修改。

瀏覽器候選資源為 14 個 fast／favicon 圖片，合計 2,564,498 bytes（約 2.45 MiB）；另有社群分享圖 `og-image.jpg` 261,481 bytes，加入線上 HTTP 量測後總量為 2,825,979 bytes（約 2.70 MiB）。所有引用圖片均保留原始高畫質檔案，fast 檔案維持原始像素尺寸，只降低編碼容量。

| 引用資源 | 格式／尺寸 | 本機 bytes | hi-res／原始資源 |
|---|---:|---:|---|
| `double-score-powerup-fast.webp` | WebP／1230×1278 | 271,936 | `double-score-powerup.webp`／328,622 |
| `idea-mallet-ready-fast.webp` | WebP／1254×1254 | 105,722 | `槌子_預設.png`／974,874 |
| `idea-mallet-strike-fast.webp` | WebP／1437×1094 | 143,430 | `槌子_打下去.png`／1,046,269 |
| `idea-mascot-fast.webp` | WebP／1246×1262 | 159,714 | `idea-mascot.webp`／205,766 |
| `rare-inspiration-fast.webp` | WebP／1312×1199 | 171,798 | `rare-inspiration.png`／1,284,729 |
| `red-distraction-fast.webp` | WebP／1305×1206 | 199,126 | `red-distraction.webp`／246,990 |
| `slow-spawn-pocketwatch-fast.webp` | WebP／1243×1266 | 262,530 | `slow-spawn-pocketwatch.png`／1,598,789 |
| `teamwork-idea-powerup-fast.webp` | WebP／1254×1254 | 221,100 | `teamwork-idea-powerup.png`／1,660,833 |
| `time-bonus-notebook-fast.webp` | WebP／1312×1199 | 183,758 | `time-bonus-notebook.png`／1,662,931 |
| `time-penalty-timer-fast.webp` | WebP／1300×1210 | 191,692 | `time-penalty-timer.png`／1,556,234 |
| `game-desk-background-fast.webp` | WebP／1672×941 | 211,734 | `game-desk-background.webp`／345,790 |
| `game-desk-background-mobile-fast.webp` | WebP／941×1672 | 210,402 | `game-desk-background-mobile.webp`／364,510 |
| `favicon-512.png` | PNG／512×512 | 224,223 | — |
| `favicon.ico` | ICO／48×48 | 7,333 | — |
| `og-image.jpg` | JPEG／1200×630 | 261,481 | 社群分享圖，不是遊戲首屏資源 |

### 線上 HTTP 實測

測量方式是對每個資源執行完整 GET，計算從 request 開始到 response body 讀完的 wall time；數值會受 GitHub Pages CDN、當時網路與序列／並行順序影響，不能視為真實手機固定秒數。

- fast／favicon 圖片抽測均為 HTTP 200；下載 bytes 與本機檔案一致。
- 回應 `Cache-Control: max-age=600`，且每個資源都有 ETag；例如桌機背景為 `"6abb9e42-33b16"`。
- 條件式 GET 實測：桌機背景帶 `If-None-Match` 回 HTTP 304，約 210 ms。
- 15 個資源合計約 2.70 MiB：序列完整下載約 11,883 ms；並行完整下載約 3,807 ms。並行較快但仍有明顯等待，表示多張圖片同時競爭頻寬是重要因素。
- 目前沒有 Canvas 圖片繪製或圖片 atlas 路徑；遊戲物件是 HTML `<img>` 動態插入，因此沒有建立 `items-atlas-fast.webp`。本次沒有直接量到瀏覽器 decode／paint 的獨立耗時，不能宣稱解碼是主瓶頸。

### 採用方案

1. 首屏品牌圖與 CSS 背景先使用既有 `*-fast.webp`；fast 與 hi-res 維持相同像素尺寸。
2. fast 圖片載入後，以 `requestIdleCallback`（不支援時退回 timeout）低優先預載原始 hi-res，完成後自動替換；同一來源使用 Promise cache 避免重複下載。
3. 槌子與規則圖例改成 `data-src`，只在按下開始或進入該流程時 hydration；它們不再於初始 HTML 解析時搶首屏頻寬。
4. 靈感、干擾物與特殊道具在實際生成時先顯示 fast，背景與動態圖片也在閒置時段升級 hi-res。
5. 桌機／橫向使用橫式 fast 背景，直式手機只套用直式 fast 背景；CSS 不再先載入桌機背景再覆寫手機背景。背景 hi-res 只依目前 media 狀態選一張載入。
6. 圖片載入失敗時移除失敗的 `src`，保留 CSS 漸層 fallback，避免出現白屏或破圖圖示。
7. 更新 `styles.css?v=7.4.15` 與 `game.js?v=7.4.15`，避免舊版快取遮蔽修正。

### 取捨、限制與回退方式

- hi-res 仍會在瀏覽器閒置後下載，因此完整遊戲使用一段時間後的總流量不會等於只下載 fast；換取的是首屏先可互動與後續畫質恢復。
- 使用者若只開啟頁面但未開始遊戲，槌子與規則圖例的 fast／hi-res 都不會請求；這降低首屏競爭，但第一次開啟規則時可能多一個 hydration 瞬間。
- CSS fallback 是漸層，不是 Canvas；目前沒有 Canvas 圖像路徑，故不引入額外 atlas 複雜度。
- 若 hi-res 載入失敗，畫面保留 fast；若 fast 本身失敗，顯示 CSS 漸層 fallback。要回退整批方案，可從 checkpoint tag `checkpoint/image-perf-before-20260929` 還原本次效能修改前的版本。

### 驗證結果

- [x] `node --check game.js`
- [x] fast／hi-res 圖片路徑存在
- [x] 圖片尺寸、格式與容量盤點完成
- [x] `git diff --check` 無 whitespace error；僅有 Git 的 LF→CRLF 提示
- [x] 線上 fast 圖片 HTTP 200（已分批完成所有 fast 資源確認）
- [x] 線上 Cache-Control、ETag、完整下載時間與條件式 304 已量測
- [ ] 真實手機實機尚未驗證
- [ ] iOS Safari 尚未驗證
- [ ] 冷快取尚未以真實手機驗證
- [ ] 慢速網路尚未以真實手機驗證
- [ ] 瀏覽器 decode／paint、實際首屏 LCP 與真實 waterfall 尚未以 DevTools 或手機實機驗證；本機沒有 Playwright／Puppeteer／可用 headless Chrome