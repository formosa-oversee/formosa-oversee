# 🔐 EPA 資料設定指南

## 🎯 快速開始

由於 EPA 資料需要 Google 帳號認證，請按照以下步驟設定：

### 方式 1: 使用 Google Cloud SDK (推薦) 

```bash
# 1. 安裝 Google Cloud SDK
# macOS:
brew install --cask google-cloud-sdk

# Windows: 下載安裝程式
# https://cloud.google.com/sdk/docs/install

# 2. 認證登入
gcloud auth login

# 3. 下載 EPA 資料
npm run download-epa

# 4. 處理資料並建置
npm run fetch-data
npm run build
```

### 方式 2: 手動下載

```bash
# 1. 在瀏覽器中登入 Google 帳號後，手動下載以下檔案：
# https://storage.cloud.google.com/epa_echo_data/integrated_facility_matches_cleaned.csv
# https://storage.cloud.google.com/epa_echo_data/comprehensive_violations_full.csv

# 2. 將檔案放置到正確位置
mkdir -p data
# 將下載的檔案重新命名並放置：
# integrated_facility_matches_cleaned.csv → data/facilities.csv
# comprehensive_violations_full.csv → data/violations.csv

# 3. 處理資料並建置
npm run fetch-data
npm run build
```

## 📊 資料檔案說明

### 設施資料 (facilities.csv)
- **來源**: integrated_facility_matches_cleaned.csv
- **內容**: EPA 註冊的設施基本資訊
- **重要欄位**: REGISTRY_ID, FAC_NAME, FAC_CITY, FAC_STATE

### 違規資料 (violations.csv)  
- **來源**: comprehensive_violations_full.csv
- **內容**: 環境違規記錄和執法案件
- **重要欄位**: REGISTRY_ID, VIOLATION_DATE, VIOLATION_TYPE

## 🔧 故障排除

### 問題 1: gcloud 未安裝
```bash
# 檢查是否已安裝
gcloud --version

# 如果未安裝，請前往官方網站下載
# https://cloud.google.com/sdk/docs/install
```

### 問題 2: 認證失敗
```bash
# 重新登入
gcloud auth login

# 檢查認證狀態
gcloud auth list
```

### 問題 3: 下載權限不足
```bash
# 確保您的 Google 帳號有存取權限
# 如果沒有權限，請聯繫資料提供者或使用官方 EPA 資料源
```

### 問題 4: 檔案格式錯誤
```bash
# 檢查下載的檔案是否為有效的 CSV
head -5 data/facilities.csv

# 如果看到 HTML 或錯誤訊息，表示下載失敗
```

## 🚀 完整工作流程

```bash
# 完整設定流程
git clone <your-repo>
cd formosa-oversee
npm install

# 方式 A: 自動下載 (需要 gcloud)
gcloud auth login
npm run setup-epa

# 方式 B: 手動下載
# 1. 手動下載檔案到 data/ 目錄
# 2. npm run fetch-data

# 建置和部署
npm run build
npm run deploy
```

## 📈 資料更新

```bash
# 定期更新 EPA 資料
npm run download-epa  # 重新下載最新資料
npm run fetch-data    # 重新處理資料
npm run build         # 重新建置網站
npm run deploy        # 部署更新
```

## 🔒 安全注意事項

1. **不要提交認證資訊** - `.gitignore` 已設定忽略服務帳號金鑰
2. **定期更新資料** - EPA 資料會定期更新
3. **檢查資料品質** - 處理前先檢查資料完整性
4. **備份重要資料** - 建議備份處理過的 JSON 檔案

## 📞 需要幫助？

如果遇到問題，請檢查：
1. Google Cloud SDK 是否正確安裝
2. 是否已正確認證
3. 網路連線是否正常
4. 檔案權限是否正確

或者使用官方 EPA 資料源：
- EPA ECHO: https://echo.epa.gov/tools/data-downloads
- EPA Envirofacts: https://www.epa.gov/enviro/


