# Formosa Oversee - 企業環境監測平台

Formosa Oversee 是一個企業環境監測平台，幫助投資者、消費者和公眾了解企業的環境表現和違規記錄。本專案是一個使用 Next.js 和 Chakra UI 構建的前端演示應用。

## 功能特色

- **企業環境監測**: 追蹤企業環境表現，查看 EPA 違規數據和環境合規狀況
- **ESG 分析**: 查看企業的環境、社會和治理表現數據
- **違規記錄追蹤**: 詳細記錄企業環保違規事件，包括罰款金額、違規類型和處理狀態
- **相關新聞聚合**: 收集國內外相關環保新聞

## 技術棧

- **前端框架**: Next.js
- **UI 庫**: Chakra UI
- **圖標**: React Icons
- **資料獲取**: 模擬數據 (未來可與 EPA ECHO API 整合)

## 開始使用

### 安裝

1. 克隆此專案
   ```
   git clone https://github.com/formosa-oversee/formosa-oversee.git
   cd formosa-oversee
   ```

2. 安裝依賴
   ```
   npm install
   ```

3. 啟動開發服務器
   ```
   npm run dev
   ```

4. 在瀏覽器中訪問 [http://localhost:3000](http://localhost:3000)

## 專案結構

- `/pages`: 網站頁面 (首頁、企業列表、企業詳情)
- `/components`: 可重用組件
- `/lib`: 工具函數、API 接口和主題設置
- `/styles`: 全局樣式
- `/public`: 靜態文件

## 資料來源

目前平台使用模擬數據，未來可以與以下 API 整合：

- [EPA ECHO API](https://echo.epa.gov/tools/web-services): 美國環境保護署的環境數據 API
- [環保署開放資料平台](https://data.epa.gov.tw/): 台灣環保署的環境數據

## 未來計畫

- API 實際連接與數據獲取
- 數據視覺化圖表和儀表板
- 多樣本企業分析與比較
- 進階搜索和過濾功能
- 使用者帳號和收藏功能

## 貢獻

歡迎對本專案進行貢獻！請隨時提交 Issue 或 Pull Request。

## 許可證

MIT 許可證 