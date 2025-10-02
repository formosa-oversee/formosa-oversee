const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * 從 Google Cloud Storage 獲取 EPA ECHO CSV 資料
 * 並轉換為靜態 JSON 檔案
 */

// 載入 GCS 配置
const GCS_CONFIG = require('../gcs-config.js');

// 輸出目錄
const DATA_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(DATA_DIR, 'epa-data.json');

/**
 * 從 GCS 下載檔案
 */
async function downloadFromGCS(bucketName, fileName) {
  // 優先使用配置中的完整 URL
  let url;
  if (GCS_CONFIG.urls && GCS_CONFIG.urls.facilities) {
    url = GCS_CONFIG.urls.facilities;
  } else {
    url = `https://storage.googleapis.com/${bucketName}/${fileName}`;
  }
  
  console.log(`正在下載: ${url}`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // 處理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFromURL(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`下載失敗: ${response.statusCode} ${response.statusMessage}\n回應: ${response.body || 'No body'}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * 從任意 URL 下載檔案
 */
async function downloadFromURL(url) {
  console.log(`重定向到: ${url}`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下載失敗: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * 解析 CSV 資料 - 正確處理引號和逗號
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');

  // 解析單行 CSV，正確處理引號內的逗號
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 雙引號轉義
          current += '"';
          i++;
        } else {
          // 切換引號狀態
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 遇到逗號且不在引號內，分割欄位
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // 加入最後一個欄位
    result.push(current.trim());
    return result;
  }

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

/**
 * 轉換 EPA 資料格式 - 支援台灣企業境外投資違規資料
 */
function transformEPAFacilityData(facilities, violations = []) {
  const companiesMap = new Map();
  
  // 優先處理違規資料（因為這個資料集更完整）
  violations.forEach(violation => {
    const companyCode = violation['公司代號'];
    const companyName = violation['投資公司名稱'];
    const companyEnglishName = violation['投資公司英文全稱'];
    const facilityName = violation['FACILITY_NAME'];
    const facilityId = violation['ICIS_FACILITY_ID'];
    
    if (!companyCode || !companyName) return;
    
    // 跳過不完整的記錄（如果啟用過濾）
    if (GCS_CONFIG.processing.filterIncompleteRecords) {
      if (!facilityName || !violation['VIOLATION_DESC']) return;
    }
    
    const companyId = `tw-${companyCode}`;
    
    if (!companiesMap.has(companyId)) {
      companiesMap.set(companyId, {
        id: companyId,
        name: companyName,
        englishName: companyEnglishName || companyName,
        parentCompany: '台灣上市公司',
        facilities: [],
        violations: [],
        enforcement: [],
        metadata: {
          dataSource: 'EPA ECHO - 台灣企業境外投資',
          lastUpdated: new Date().toISOString(),
          companyCode: companyCode
        }
      });
    }
    
    const company = companiesMap.get(companyId);
    
    // 建立或更新設施資料
    let facility = company.facilities.find(f => f.facilityId === facilityId);
    if (!facility) {
      facility = {
        facilityId: facilityId,
        name: facilityName,
        registryId: violation['NPDES_ID'] || facilityId,
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: violation['地區別代號']?.includes('美國') ? 'USA' : 'Unknown',
        industry: 'N/A',
        coordinates: {
          latitude: null,
          longitude: null
        },
        programs: {
          air: false,
          water: true, // 大部分是水污染違規
          waste: false,
          toxics: false
        }
      };
      company.facilities.push(facility);
    }

    // 建立違規記錄
    const violationRecord = {
      violationId: violation['NPDES_VIOLATION_ID'] || `EPA-${companyCode}-${Date.now()}`,
      violationTypeCode: violation['VIOLATION_TYPE_CODE'],
      violationCode: violation['VIOLATION_CODE'],
      description: violation['VIOLATION_DESC'] || 'N/A',
      date: violation['SINGLE_EVENT_VIOLATION_DATE'] || violation['RNC_DETECTION_DATE'] || 'N/A',
      endDate: violation['SINGLE_EVENT_END_DATE'] || 'N/A',
      comment: violation['SINGLE_EVENT_VIOLATION_COMMENT'] || '',
      agencyType: violation['SINGLE_EVENT_AGENCY_TYPE_CODE'] || 'N/A',
      rncDetectionCode: violation['RNC_DETECTION_CODE'],
      rncDetectionDesc: violation['RNC_DETECTION_DESC'],
      rncDetectionDate: violation['RNC_DETECTION_DATE'],
      rncResolutionCode: violation['RNC_RESOLUTION_CODE'],
      rncResolutionDesc: violation['RNC_RESOLUTION_DESC'],
      rncResolutionDate: violation['RNC_RESOLUTION_DATE'],
      violationType: violation['VIOLATION_TYPE'],
      violationTypeDesc: violation['VIOLATION_TYPE_DESC'],
      status: violation['RNC_RESOLUTION_DESC'] || 'Unknown',
      source: 'EPA ECHO',
      plantSite: `${facilityName}, ${violation['地區別代號']?.replace(/^\d+--/, '') || 'Unknown'}`,
      fine: 'N/A', // 這個資料集中沒有罰款資訊

      // DMR 相關欄位（如果存在）
      parameterCode: violation['PARAMETER_CODE'],
      parameterDesc: violation['PARAMETER_DESC'],
      limitValue: violation['LIMIT_VALUE_STANDARD_UNITS'],
      dmrValue: violation['ADJUSTED_DMR_STANDARD_UNITS'] || violation['DMR_VALUE_STANDARD_UNITS'],
      exceedencePct: violation['EXCEEDENCE_PCT'],
      standardUnit: violation['STANDARD_UNIT_DESC'],
      monitoringPeriodEnd: violation['MONITORING_PERIOD_END_DATE'],
      daysLate: violation['DAYS_LATE']
    };
    
    company.violations.push(violationRecord);
  });
  
  // 處理設施資料（如果有的話）
  facilities.forEach(facility => {
    const facilityId = facility.REGISTRY_ID || facility.FACILITY_ID || facility.ID;
    if (!facilityId) return;
    
    // 檢查是否已經在違規資料中處理過
    const existingCompany = Array.from(companiesMap.values())
      .find(c => c.facilities.some(f => f.facilityId === facilityId));
    
    if (existingCompany) {
      // 更新現有設施資料
      const existingFacility = existingCompany.facilities.find(f => f.facilityId === facilityId);
      if (existingFacility) {
        existingFacility.address = facility.FAC_STREET || facility.LOCATION_ADDRESS || existingFacility.address;
        existingFacility.city = facility.FAC_CITY || facility.CITY || existingFacility.city;
        existingFacility.state = facility.FAC_STATE || facility.STATE || existingFacility.state;
        existingFacility.zipCode = facility.FAC_ZIP || facility.ZIP || existingFacility.zipCode;
        existingFacility.industry = facility.SIC_CODES || facility.NAICS_CODES || existingFacility.industry;
        existingFacility.coordinates = {
          latitude: facility.FAC_LAT || facility.LATITUDE || existingFacility.coordinates.latitude,
          longitude: facility.FAC_LONG || facility.LONGITUDE || existingFacility.coordinates.longitude
        };
      }
    } else {
      // 新增沒有在違規資料中的設施
      const facilityName = facility.FAC_NAME || facility.FACILITY_NAME || 'Unknown Facility';
      const companyName = facility.COMPANY_NAME || facilityName;
      const companyId = `us-${facilityId}`;
      
      companiesMap.set(companyId, {
        id: companyId,
        name: companyName,
        englishName: companyName,
        parentCompany: 'N/A',
        facilities: [{
          facilityId: facilityId,
          name: facilityName,
          registryId: facilityId,
          address: facility.FAC_STREET || facility.LOCATION_ADDRESS || 'N/A',
          city: facility.FAC_CITY || facility.CITY || 'N/A',
          state: facility.FAC_STATE || facility.STATE || 'N/A',
          zipCode: facility.FAC_ZIP || facility.ZIP || 'N/A',
          country: facility.COUNTRY || 'USA',
          industry: facility.SIC_CODES || facility.NAICS_CODES || facility.PRIMARY_SIC_CODE || 'N/A',
          coordinates: {
            latitude: facility.FAC_LAT || facility.LATITUDE || null,
            longitude: facility.FAC_LONG || facility.LONGITUDE || null
          },
          programs: {
            air: facility.AIR_FLAG === 'Y' || facility.CAA_FLAG === 'Y',
            water: facility.NPDES_FLAG === 'Y' || facility.CWA_FLAG === 'Y',
            waste: facility.RCRA_FLAG === 'Y',
            toxics: facility.TRI_FLAG === 'Y'
          }
        }],
        violations: [],
        enforcement: [],
        metadata: {
          dataSource: 'EPA ECHO - 設施資料',
          lastUpdated: new Date().toISOString()
        }
      });
    }
  });
  
  return Array.from(companiesMap.values());
}

/**
 * 主要執行函數
 */
async function main() {
  try {
    console.log('🚀 開始從 GCS 獲取 EPA 資料...');
    
    // 確保資料目錄存在
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // 檢查本地檔案是否存在
    const facilitiesFile = path.join(DATA_DIR, 'facilities.csv');
    const violationsFile = path.join(DATA_DIR, 'violations.csv');
    
    let facilitiesCSV, violationsCSV;
    
    if (fs.existsSync(facilitiesFile)) {
      console.log('📥 從本地檔案載入設施資料...');
      facilitiesCSV = fs.readFileSync(facilitiesFile, 'utf8');
    } else {
      console.log('📥 從 GCS 下載設施資料...');
      facilitiesCSV = await downloadFromGCS(GCS_CONFIG.bucket, GCS_CONFIG.files.facilities);
    }
    
    if (fs.existsSync(violationsFile)) {
      console.log('📥 從本地檔案載入違規資料...');
      violationsCSV = fs.readFileSync(violationsFile, 'utf8');
    } else {
      console.log('📥 從 GCS 下載違規資料...');
      try {
        violationsCSV = await downloadFromGCS(GCS_CONFIG.bucket, GCS_CONFIG.files.violations);
      } catch (error) {
        console.log('⚠️ 違規資料下載失敗，僅使用設施資料');
        violationsCSV = '';
      }
    }
    
    // 解析 CSV
    console.log('🔄 解析 CSV 資料...');
    const facilities = parseCSV(facilitiesCSV);
    const violations = violationsCSV ? parseCSV(violationsCSV) : [];
    
    console.log(`解析完成: ${facilities.length} 設施記錄, ${violations.length} 違規記錄`);
    
    // 限制處理記錄數（用於測試）
    const recordsToProcess = GCS_CONFIG.processing.maxRecords 
      ? facilities.slice(0, GCS_CONFIG.processing.maxRecords)
      : facilities;
    
    if (GCS_CONFIG.processing.maxRecords) {
      console.log(`🔄 限制處理記錄數: ${recordsToProcess.length}`);
    }
    
    // 轉換資料格式
    console.log('🔄 轉換資料格式...');
    const transformedData = transformEPAFacilityData(recordsToProcess, violations);
    
    // 儲存為 JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformedData, null, 2));
    
    console.log(`✅ 資料處理完成！已儲存到 ${OUTPUT_FILE}`);
    console.log(`📊 處理了 ${transformedData.length} 家公司的資料`);
    
  } catch (error) {
    console.error('❌ 處理過程中發生錯誤:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = { main, transformEPAFacilityData, parseCSV };
