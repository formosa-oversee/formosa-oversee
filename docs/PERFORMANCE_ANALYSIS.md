# Formosa Oversee - 效能分析報告

**分析日期**：2025-10-11
**分析人員**：Claude Code

## 執行摘要

網站首頁載入時間達到 **20 秒**，遠超可接受範圍（理想值 <3 秒）。主要瓶頸為過大的 HTML 檔案和 Cloudflare 快取配置問題。

---

## 測試結果

### Endpoint 效能測試

| Endpoint | 回應時間 | 檔案大小 | Cache Status |
|----------|---------|---------|--------------|
| `/` (首頁) | 20.2 秒 | 476 KB | DYNAMIC (不快取) |
| `/companies` | 20.6 秒 | 726 KB | DYNAMIC (不快取) |
| `/` (第二次請求) | 20.4 秒 | 476 KB | DYNAMIC (不快取) |

**關鍵發現**：
- 所有頁面一致性地需要 ~20 秒載入
- Cloudflare 標記所有 HTML 為 `DYNAMIC`，完全不快取
- 重複請求沒有改善，表示沒有瀏覽器或 CDN 快取

---

## 根本原因分析

### 1. HTML 檔案過大（主要問題）

**發現**：
```bash
$ ls -lh out/index.html out/companies.html
-rw-r--r--  465K  index.html
-rw-r--r--  708K  companies.html
```

**原因**：
檢查 HTML 內容發現，整個 **Noto Sans TC** 中文字體的 CSS 定義被內嵌在每個 HTML 檔案中：

```html
<style data-href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap">
@font-face{font-family:'Noto Sans TC';font-style:normal;font-weight:300; ...}
@font-face{font-family:'Noto Sans TC';font-style:normal;font-weight:400; ...}
<!-- 數百個 @font-face 定義，包含所有 Unicode 範圍 -->
</style>
```

- 字體 CSS 包含數百個 `@font-face` 規則
- 每個規則定義不同的 unicode-range
- 總計超過 **400 KB** 的字體定義
- 這些應該從 Google Fonts CDN 載入，而非內嵌

### 2. Cloudflare 快取配置問題

**HTTP Headers 分析**：
```
cf-cache-status: DYNAMIC
cache-control: max-age=600
server: cloudflare
```

**問題**：
- Cloudflare 將所有 HTML 標記為 `DYNAMIC`
- 即使設定了 `cache-control: max-age=600`，但因為 DYNAMIC 標記而不快取
- GitHub Pages 預設 headers 可能導致 Cloudflare 不快取靜態內容

### 3. 建置時資料過大警告

建置時 Next.js 警告：
```
Warning: data for page "/companies/[id]" (path "/companies/tw-2607") is 665 kB
which exceeds the threshold of 128 kB
```

多個公司頁面的資料超過 128 KB，包括：
- `tw-2607`: 665 KB
- `tw-1402`: 292 KB
- `tw-8478`: 293 KB
- `tw-1524`: 242 KB

---

## 效能影響

### 使用者體驗

| 指標 | 當前值 | 理想值 | 評級 |
|------|--------|--------|------|
| 首次內容繪製 (FCP) | ~20s | <1.8s | 🔴 差 |
| 最大內容繪製 (LCP) | ~20s | <2.5s | 🔴 差 |
| 互動時間 (TTI) | ~20s | <3.8s | 🔴 差 |

### 商業影響

- **跳出率**：載入 20 秒會導致 90%+ 使用者離開
- **SEO**：Google 會因為速度慢而降低排名
- **可用性**：使用者可能認為網站故障

---

## 解決方案建議

### 優先級 1：修復字體載入（關鍵）

**問題**：Google Fonts CSS 被內嵌到 HTML 中

**解決方案 A**：使用外部字體連結（推薦）

在 `pages/_app.js` 中修改字體載入方式：

```javascript
// 移除或修改 chakra-ui 的字體配置
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* 使用 link 而非 @import */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}
```

**解決方案 B**：使用 `next/font`（Next.js 14 推薦）

```javascript
import { Noto_Sans_TC } from 'next/font/google';

const notoSansTC = Noto_Sans_TC({
  weight: ['300', '400', '500', '700'],
  subsets: ['chinese-traditional'],
  display: 'swap',
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <main className={notoSansTC.className}>
        <Component {...pageProps} />
      </main>
    </ChakraProvider>
  );
}
```

**預期改善**：
- HTML 大小從 465 KB 降至 ~10 KB
- 載入時間從 20 秒降至 <2 秒
- 字體從 CDN 並行載入，可快取

### 優先級 2：設定 Cloudflare Page Rules

**目標**：強制快取靜態 HTML 檔案

**步驟**：

1. 前往 Cloudflare Dashboard → **Rules** → **Page Rules**
2. 新增規則：
   ```
   URL: formosaoversee.com/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 hour
   - Browser Cache TTL: 30 minutes
   ```

3. 針對 HTML 檔案：
   ```
   URL: formosaoversee.com/*.html
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 10 minutes
   ```

**預期改善**：
- 重複訪問可從 Cloudflare Edge 直接回應
- 回應時間從 20 秒降至 <500ms（已快取）

### 優先級 3：優化資料大小

**問題**：部分頁面資料超過 665 KB

**解決方案**：

1. **分頁載入違規記錄**：
   ```javascript
   // 在 getStaticProps 中只載入前 50 筆違規
   export async function getStaticProps({ params }) {
     const company = getCompanyById(params.id);
     const recentViolations = company.violations.slice(0, 50);

     return {
       props: {
         company: {
           ...company,
           violations: recentViolations,
           totalViolations: company.violations.length,
         }
       }
     };
   }
   ```

2. **使用 API Routes 動態載入**：
   ```javascript
   // 首次只載入基本資訊，詳細違規記錄透過 API 載入
   useEffect(() => {
     fetch(`/api/companies/${id}/violations?page=1`)
       .then(res => res.json())
       .then(data => setViolations(data));
   }, [id]);
   ```

3. **資料壓縮**：
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,  // 啟用 gzip 壓縮
   };
   ```

**預期改善**：
- 頁面資料從 665 KB 降至 <100 KB
- 建置時間縮短
- 改善 SEO 和使用者體驗

### 優先級 4：加入 .nojekyll 到 CNAME 同級

**問題**：GitHub Pages 可能使用 Jekyll 處理檔案

**解決方案**：
工作流程已包含此步驟，但確保 `.nojekyll` 檔案存在於輸出目錄

---

## 實施計劃

### Phase 1：緊急修復（1-2 小時）

1. ✅ 修改 `pages/_app.js` 字體載入方式
2. ✅ 重新建置並部署
3. ✅ 驗證 HTML 檔案大小降至 <50 KB

### Phase 2：快取優化（30 分鐘）

1. ✅ 設定 Cloudflare Page Rules
2. ✅ 清除 Cloudflare 快取
3. ✅ 測試快取效果

### Phase 3：資料優化（2-4 小時）

1. ⏳ 實作分頁載入
2. ⏳ 建立 API Routes
3. ⏳ 測試並優化查詢效能

### Phase 4：監控與驗證（持續）

1. ⏳ 使用 Google PageSpeed Insights 監控
2. ⏳ 設定 Cloudflare Analytics
3. ⏳ 定期效能測試

---

## 監控建議

### 工具

1. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/
   - 分析: https://pagespeed.web.dev/analysis?url=https://formosaoversee.com

2. **WebPageTest**
   - https://www.webpagetest.org/
   - 可測試不同地區和裝置的載入速度

3. **Cloudflare Analytics**
   - 在 Cloudflare Dashboard 查看快取命中率
   - 監控頻寬使用

### 目標指標

| 指標 | 目標值 |
|------|--------|
| FCP | <1.8s |
| LCP | <2.5s |
| TTI | <3.8s |
| HTML Size | <50 KB |
| Total Page Size | <1 MB |
| Cache Hit Rate | >80% |

---

## 技術細節

### 目前架構

```
GitHub Pages (Origin)
        ↓
   Cloudflare CDN
        ↓
      使用者
```

### 目前問題流程

```
1. 使用者請求 formosaoversee.com
   ↓
2. Cloudflare 收到請求，檢查 cf-cache-status
   ↓
3. 標記為 DYNAMIC，不使用快取
   ↓
4. 向 GitHub Pages 請求完整 HTML (465 KB)
   ↓
5. GitHub Pages 回應（慢，約 15-20 秒）
   ↓
6. Cloudflare 傳送給使用者（不快取）
   ↓
7. 下次請求重複步驟 1-6
```

### 優化後流程

```
1. 使用者請求 formosaoversee.com
   ↓
2. Cloudflare 檢查 Edge Cache
   ↓
3. Cache HIT！直接回應（~50ms）
   ↓
4. 使用者收到輕量 HTML (<50 KB)
   ↓
5. 字體從 Google Fonts CDN 並行載入
   ↓
6. 總載入時間 <2 秒
```

---

## 參考資源

- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Cloudflare Page Rules](https://developers.cloudflare.com/rules/page-rules/)
- [Google Web Vitals](https://web.dev/vitals/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

## 附錄：測試命令

### 測試載入速度
```bash
curl -w "\nTime: %{time_total}s\nSize: %{size_download} bytes\n" \
  -s -o /dev/null https://formosaoversee.com/
```

### 檢查 Cache Headers
```bash
curl -I https://formosaoversee.com/ | grep -i "cache\|age\|cloudflare"
```

### 測試建置
```bash
npm run build
ls -lh out/*.html
```

### 檢查 HTML 大小
```bash
wc -c out/index.html out/companies.html
```

---

**結論**：主要瓶頸為內嵌字體 CSS 導致 HTML 過大，加上 Cloudflare 不快取 DYNAMIC 內容。修復字體載入方式預期可將載入時間從 20 秒降至 <2 秒，大幅改善使用者體驗。
