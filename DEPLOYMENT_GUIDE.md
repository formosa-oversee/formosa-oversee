# Formosa Oversee - GitHub Pages 部署指南

本指南將協助你透過 GitHub Actions 將專案部署到 GitHub Pages，並使用 Cloudflare 自訂域名 `formosaoversee.com`。

## 目錄
- [前置需求](#前置需求)
- [專案配置](#專案配置)
- [GitHub Pages 設定](#github-pages-設定)
- [Cloudflare DNS 設定](#cloudflare-dns-設定)
- [部署流程](#部署流程)
- [驗證部署](#驗證部署)
- [故障排除](#故障排除)

---

## 前置需求

1. **GitHub 帳號**：確保你有專案的存取權限
2. **Cloudflare 帳號**：並且已經將 `formosaoversee.com` 域名加入 Cloudflare
3. **Git**：本機已安裝 Git
4. **Node.js**：版本 18 或以上

---

## 專案配置

本專案已經完成以下配置：

### 1. Next.js 設定 (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  images: {
    unoptimized: true,
  },
  assetPrefix: '',
};

module.exports = nextConfig;
```

- `output: 'export'`：啟用靜態網站匯出
- `images.unoptimized: true`：靜態匯出不支援圖像優化
- `basePath` 和 `assetPrefix` 設為空字串，因為使用自訂域名

### 2. CNAME 檔案

專案根目錄的 `CNAME` 檔案內容：
```
formosaoversee.com
```

此檔案告訴 GitHub Pages 使用自訂域名。

### 3. GitHub Actions 工作流程 (`.github/workflows/deploy.yml`)

已配置自動部署工作流程：
- **觸發條件**：推送到 `main` 分支或手動觸發
- **建置步驟**：
  1. 檢出程式碼
  2. 設定 Node.js 18
  3. 安裝依賴 (`npm ci`)
  4. 執行建置 (`npm run build`)
  5. 建立 `.nojekyll` 檔案（避免 Jekyll 處理）
  6. 複製 CNAME 到輸出目錄
  7. 上傳並部署到 GitHub Pages

---

## GitHub Pages 設定

### 步驟 1：啟用 GitHub Pages

1. 前往你的 GitHub 專案頁面
2. 點擊 **Settings** (設定)
3. 在左側選單找到 **Pages**
4. 在 **Source** (來源) 部分：
   - 選擇 **GitHub Actions**（不是傳統的分支部署方式）

   ![GitHub Pages Source](https://docs.github.com/assets/cb-47267/mw-1440/images/help/pages/select-github-actions-source.webp)

### 步驟 2：確認工作流程權限（可選）

**注意**：由於我們的工作流程檔案（`.github/workflows/deploy.yml`）中已經明確定義了所需權限：
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

因此**不需要**在 Settings 中修改 Workflow permissions。如果你遇到權限相關錯誤，可以檢查以下設定：

1. 前往 **Settings** → **Actions** → **General**
2. 捲動到 **Workflow permissions**
3. 確認沒有選擇「禁用 Actions」的選項

**如果無法勾選 "Read and write permissions"**：
- 這可能是因為你的 repo 屬於組織（Organization），組織管理員可能限制了這個選項
- 不用擔心，我們的工作流程已在 YAML 中定義了必要權限，不需要這個設定
- 如果仍然遇到權限問題，請聯絡組織管理員檢查組織層級的 Actions 設定

---

## Cloudflare DNS 設定

### 步驟 1：登入 Cloudflare

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 選擇你的域名 `formosaoversee.com`

### 步驟 2：設定 DNS 記錄

需要新增以下 DNS 記錄：

#### 選項 A：使用 A 記錄（推薦）

新增以下 4 個 A 記錄指向 GitHub Pages 的 IP：

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|--------------|-----|
| A | @ | 185.199.108.153 | DNS only (灰色雲朵) | Auto |
| A | @ | 185.199.109.153 | DNS only (灰色雲朵) | Auto |
| A | @ | 185.199.110.153 | DNS only (灰色雲朵) | Auto |
| A | @ | 185.199.111.153 | DNS only (灰色雲朵) | Auto |

#### 選項 B：使用 CNAME 記錄（如果你要使用 www 子域名）

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|--------------|-----|
| CNAME | www | `{你的GitHub使用者名稱}.github.io` | DNS only (灰色雲朵) | Auto |

**重要注意事項**：
- 初次設定時，**必須先關閉 Cloudflare Proxy**（灰色雲朵）
- 等 GitHub Pages 驗證 DNS 並發出 SSL 憑證後，才能開啟 Proxy（橘色雲朵）
- 這個過程可能需要 24-48 小時

### 步驟 3：SSL/TLS 設定

1. 在 Cloudflare 中，前往 **SSL/TLS** → **Overview**
2. 設定 SSL/TLS 加密模式為 **Full** 或 **Full (strict)**

---

## 部署流程

### 自動部署

每次推送到 `main` 分支時，GitHub Actions 會自動執行部署：

```bash
git add .
git commit -m "Update site"
git push origin main
```

### 手動部署

1. 前往 GitHub 專案頁面
2. 點擊 **Actions** 標籤
3. 選擇 **Deploy Next.js site to Pages** 工作流程
4. 點擊 **Run workflow** 按鈕
5. 選擇 `main` 分支並點擊 **Run workflow**

---

## 驗證部署

### 1. 檢查 GitHub Actions

1. 前往專案的 **Actions** 標籤
2. 確認最新的工作流程執行成功（綠色勾勾）
3. 點擊查看詳細日誌

### 2. 檢查 GitHub Pages 狀態

1. 前往 **Settings** → **Pages**
2. 你應該會看到：
   - 「Your site is live at https://formosaoversee.com」
   - 綠色勾勾表示自訂域名已驗證

### 3. 測試網站

開啟瀏覽器訪問：
- https://formosaoversee.com
- 確認內容正確顯示
- 檢查 HTTPS 是否正常運作

---

## 故障排除

### 問題 1：自訂域名無法驗證

**症狀**：GitHub Pages 顯示「DNS check unsuccessful」

**解決方案**：
1. 確認 DNS 記錄正確設定
2. 使用 `dig` 或 `nslookup` 檢查 DNS 解析：
   ```bash
   dig formosaoversee.com
   nslookup formosaoversee.com
   ```
3. DNS 變更可能需要數小時才會生效
4. 確保 Cloudflare Proxy 已關閉（灰色雲朵）

### 問題 2：404 錯誤

**症狀**：訪問網站顯示 404 Not Found

**可能原因與解決方案**：
1. **建置失敗**：檢查 GitHub Actions 日誌
2. **CNAME 檔案遺失**：確認 `CNAME` 檔案存在於 `out/` 目錄
3. **路徑問題**：確認 `next.config.js` 中的 `basePath` 設定正確

### 問題 3：GitHub Actions 工作流程失敗

**檢查步驟**：
1. 查看 Actions 標籤中的錯誤訊息
2. 常見問題：
   - **權限問題**：確認 Workflow permissions 設定正確
   - **依賴安裝失敗**：嘗試刪除 `package-lock.json` 並重新 commit
   - **建置錯誤**：本機執行 `npm run build` 檢查

### 問題 4：CSS 或 JS 檔案載入失敗

**症狀**：網站顯示但樣式或功能異常

**解決方案**：
1. 檢查瀏覽器開發者工具的 Console 和 Network 標籤
2. 確認 `assetPrefix` 設定正確
3. 檢查 `.nojekyll` 檔案是否存在於 `out/` 目錄

### 問題 5：HTTPS 憑證錯誤

**症狀**：瀏覽器顯示憑證警告

**解決方案**：
1. GitHub Pages 需要時間為自訂域名發行 SSL 憑證（最多 24 小時）
2. 確保 **Enforce HTTPS** 選項已勾選（在 Settings → Pages）
3. 如果使用 Cloudflare Proxy，確認 SSL/TLS 模式為 Full

---

## 本機測試

在推送到 GitHub 之前，建議先在本機測試：

```bash
# 安裝依賴
npm install

# 執行開發伺服器
npm run dev

# 建置專案
npm run build

# 檢查輸出目錄
ls -la out/

# 本機預覽建置結果
npx serve out
```

---

## 重要檔案清單

- `CNAME`：自訂域名設定
- `.github/workflows/deploy.yml`：GitHub Actions 部署腳本
- `next.config.js`：Next.js 配置
- `package.json`：專案依賴和腳本

---

## 參考資源

- [GitHub Pages 官方文件](https://docs.github.com/en/pages)
- [Next.js 靜態匯出文件](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Cloudflare DNS 文件](https://developers.cloudflare.com/dns/)
- [GitHub Actions 文件](https://docs.github.com/en/actions)

---

## 支援

如果遇到問題，請：
1. 檢查 GitHub Actions 日誌
2. 查看 GitHub Pages 設定頁面的錯誤訊息
3. 參考本文件的「故障排除」章節

---

**最後更新**：2025-10-11
