import fs from 'fs';
import path from 'path';

/**
 * GCS Data API - Server Side Only (for getStaticProps)
 * 只能在 Next.js 的 getStaticProps/getStaticPaths 中使用
 */

let cachedData = null;

/**
 * 載入 GCS 處理後的 EPA 資料
 */
const loadGCSData = () => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'epa-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    cachedData = JSON.parse(rawData);
    return cachedData;
  } catch (error) {
    console.error('Error loading GCS data:', error.message);
    return [];
  }
};

/**
 * 獲取所有公司列表
 */
export const getAllCompanies = () => {
  const data = loadGCSData();
  return data.map(company => ({
    id: company.id,
    name: company.name,
    englishName: company.englishName,
    companyCode: company.companyCode,
    industry: company.industry || 'N/A',
    logoUrl: company.logoUrl || null,
    violationCount: company.violations?.length || 0,
    facilityCount: company.facilities?.length || 0
  }));
};

/**
 * 根據公司 ID 或公司代號獲取公司完整資料
 */
export const getCompanyData = (identifier) => {
  const data = loadGCSData();

  let company = data.find(c => c.id === identifier);
  if (!company) {
    company = data.find(c => c.companyCode === identifier);
  }
  if (!company) {
    company = data.find(c => c.id === `tw-${identifier}`);
  }

  return company;
};

/**
 * 獲取公司的所有設施資訊
 */
export const getCompanyFacilities = (identifier) => {
  const company = getCompanyData(identifier);

  if (!company || !company.facilities) {
    return [];
  }

  return company.facilities;
};

/**
 * 獲取所有公司 ID（用於 getStaticPaths）
 */
export const getAllCompanyIds = () => {
  const data = loadGCSData();
  return data.map(company => company.id);
};

export default {
  getAllCompanies,
  getCompanyData,
  getCompanyFacilities,
  getAllCompanyIds
};
