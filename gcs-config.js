/**
 * Google Cloud Storage 配置 - 真實 EPA 資料
 */

module.exports = {
  // GCS Bucket 配置
  bucket: 'epa_echo_data',
  projectId: 'formosa-oversee', // 如果需要認證，請填入您的專案 ID
  
  // CSV 檔案配置
  files: {
    // 主要設施資料
    facilities: 'integrated_facility_matches_cleaned.csv',
    // 違規資料
    violations: 'comprehensive_violations_full.csv'
  },
  
  // 完整 URL (需要認證)
  urls: {
    facilities: 'https://storage.cloud.google.com/epa_echo_data/integrated_facility_matches_cleaned.csv',
    violations: 'https://storage.cloud.google.com/epa_echo_data/comprehensive_violations_full.csv'
  },
  
  // 認證方式
  auth: {
    // 方式 1: 嘗試公開存取（測試顯示需要認證）
    public: false,
    
    // 方式 2: 使用 Google Cloud SDK 認證
    useGcloudAuth: true,
    
    // 方式 3: 服務帳號認證
    // serviceAccountKeyPath: './service-account-key.json'
  },
  
  // 資料處理選項
  processing: {
    // 是否合併重複的公司記錄
    mergeDuplicateCompanies: true,
    
    // 是否包含歷史資料
    includeHistoricalData: true,
    
    // 資料品質過濾
    filterIncompleteRecords: true,
    
    // 最大處理記錄數（用於測試）
    maxRecords: null // null = 處理所有記錄
  },
  
  // 快取設定
  cache: {
    // 本地快取檔案路徑
    localFile: './data/cached-epa-data.json',
    
    // 快取有效期（毫秒）
    ttl: 24 * 60 * 60 * 1000 // 24 小時
  }
};
