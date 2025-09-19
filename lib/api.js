import axios from 'axios';

// EPA ECHO API URL
const ECHO_API_BASE = 'https://echo.epa.gov/api/echo';
const ECHO_API_ENFORCEMENTS = '/echo_rest_services.get_enforcement_case';

// 模擬數據
export const getCompanyBasicInfo = async (facilityId) => {
  const facilitiesData = {
    'formosa-plastics-tx': {
      name: '台塑塑膠股份有限公司 (德州廠)',
      englishName: 'Formosa Plastics Corporation, USA',
      facilityId: '110018925957',
      facilityName: '德州廠',
      facilityEnglishName: 'Texas Plant',
      address: '201 FORMOSA DRIVE, POINT COMFORT, TX 77978',
      industry: '石化產業',
      employeeCount: '約2,000人',
      carbonEmissions: '8.2百萬噸 (2022)',
      reportUrl: 'https://www.fpcusa.com/esg-report.html',
      foundedYear: '1978',
      parentCompany: '台塑集團',
      revenue: '約35億美元 (2022)'
    },
    'formosa-plastics-tw': {
      name: '台塑塑膠股份有限公司 (台灣廠)',
      englishName: 'Formosa Plastics Corporation, Taiwan',
      facilityId: 'TW-FPC-001',
      facilityName: '台灣廠',
      facilityEnglishName: 'Taiwan Plant',
      address: '雲林縣麥寮鄉台塑工業園區1號',
      industry: '石化產業',
      employeeCount: '約3,500人',
      carbonEmissions: '6.5百萬噸 (2022)',
      reportUrl: 'https://www.fpc.com.tw/esg-report.html',
      foundedYear: '1954',
      parentCompany: '台塑集團',
      revenue: '約420億新台幣 (2022)'
    },
    'nan-ya-plastics': { // Consolidated Nan Ya Plastics entry
      name: '南亞塑膠工業股份有限公司', // General name
      englishName: 'Nan Ya Plastics Corporation',
      facilityId: 'TW-NYP-001', // Using existing ID, can be a generic one
      facilityName: '所有廠區總覽', // General facility name
      facilityEnglishName: 'All Sites Overview',
      address: '台灣高雄市前鎮區中山三路33號 (總公司地址)', // Example: HQ address
      industry: '塑膠製造、化工、電子材料、聚酯纖維', // General industry
      employeeCount: 'N/A', // Or total employees if known
      carbonEmissions: 'N/A',
      reportUrl: 'https://www.npc.com.tw/csr-report', // Official CSR/ESG report URL
      foundedYear: '1958',
      parentCompany: '台塑集團',
      revenue: 'N/A' // Or total revenue if known
    },
    'evergreen-marine': {
      name: '長榮海運股份有限公司 (台北總部)',
      englishName: 'Evergreen Marine Corp.',
      facilityId: 'TW-EMC-001',
      facilityName: '台北總部',
      facilityEnglishName: 'Taipei Headquarters',
      address: '台北市松山區民生東路二段166號',
      industry: '航運業',
      employeeCount: '約1,800人',
      carbonEmissions: '4.2百萬噸 (2022)',
      reportUrl: 'https://www.evergreen-marine.com/esg-report.html',
      foundedYear: '1968',
      parentCompany: '長榮集團',
      revenue: '約520億新台幣 (2022)'
    },
    'china-steel': {
      name: '中國鋼鐵股份有限公司 (高雄廠)',
      englishName: 'China Steel Corporation',
      facilityId: 'TW-CSC-001',
      facilityName: '高雄廠',
      facilityEnglishName: 'Kaohsiung Plant',
      address: '高雄市小港區中鋼路1號',
      industry: '鋼鐵製造',
      employeeCount: '約9,500人',
      carbonEmissions: '10.5百萬噸 (2022)',
      reportUrl: 'https://www.csc.com.tw/esg-report.html',
      foundedYear: '1971',
      parentCompany: '中鋼集團',
      revenue: '約680億新台幣 (2022)'
    },
    'foxconn-tucheng': {
      name: '鴻海精密工業股份有限公司 (土城總部)',
      englishName: 'Hon Hai Precision Industry Co., Ltd.',
      facilityId: 'TW-HHP-001',
      facilityName: '土城總部',
      facilityEnglishName: 'Tucheng Headquarters',
      address: '新北市土城區中山路66號',
      industry: '電子製造服務',
      employeeCount: '約8,000人 (總部行政)',
      carbonEmissions: '0.3百萬噸 (2023)',
      reportUrl: 'https://www.honhai.com/csr-report.html',
      foundedYear: '1974',
      parentCompany: '鴻海集團',
      revenue: '總部管理 (全集團6兆新台幣)'
    },
    'foxconn-shenzhen': {
      name: '鴻海精密工業股份有限公司 (深圳龍華廠)',
      englishName: 'Hon Hai Precision Industry Co., Ltd.',
      facilityId: 'CN-FXN-001',
      facilityName: '深圳龍華科技園',
      facilityEnglishName: 'Shenzhen Longhua Technology Park',
      address: '中國廣東省深圳市龍華區龍華街道',
      industry: '電子製造服務',
      employeeCount: '約30萬人 (富士康城)',
      carbonEmissions: '8.5百萬噸 (2023)',
      reportUrl: 'https://www.honhai.com/csr-report.html',
      foundedYear: '1988',
      parentCompany: '鴻海集團',
      revenue: '約1.8兆新台幣 (iPhone/iPad組裝)'
    },
    'foxconn-zhengzhou': {
      name: '鴻海精密工業股份有限公司 (鄭州廠)',
      englishName: 'Hon Hai Precision Industry Co., Ltd.',
      facilityId: 'CN-FXN-002',
      facilityName: '鄭州航空港科技園',
      facilityEnglishName: 'Zhengzhou Airport Economy Zone',
      address: '中國河南省鄭州市航空港經濟綜合實驗區',
      industry: '電子製造服務',
      employeeCount: '約20萬人 (iPhone城)',
      carbonEmissions: '5.2百萬噸 (2023)',
      reportUrl: 'https://www.honhai.com/csr-report.html',
      foundedYear: '2010',
      parentCompany: '鴻海集團',
      revenue: '約2.1兆新台幣 (全球最大iPhone生產基地)'
    },
    'foxconn-taiyuan': {
      name: '鴻海精密工業股份有限公司 (太原廠)',
      englishName: 'Hon Hai Precision Industry Co., Ltd.',
      facilityId: 'CN-FXN-003',
      facilityName: '太原科技工業園',
      facilityEnglishName: 'Taiyuan Technology Industrial Park',
      address: '中國山西省太原市清徐縣',
      industry: '電子製造服務',
      employeeCount: '約12萬人',
      carbonEmissions: '2.8百萬噸 (2023)',
      reportUrl: 'https://www.honhai.com/csr-report.html',
      foundedYear: '2007',
      parentCompany: '鴻海集團',
      revenue: '約8,000億新台幣 (手機組裝、金屬結構件)'
    },
    'foxconn-wisconsin': {
      name: '鴻海精密工業股份有限公司 (威斯康辛廠)',
      englishName: 'Hon Hai Precision Industry Co., Ltd.',
      facilityId: 'US-FXN-001',
      facilityName: '威斯康辛科學技術園',
      facilityEnglishName: 'Wisconsin Science & Technology Park',
      address: '1 Foxconn Way, Mount Pleasant, WI 53177, USA',
      industry: '電子製造服務',
      employeeCount: '約1,500人 (大幅縮減後)',
      carbonEmissions: '0.1百萬噸 (2023)',
      reportUrl: 'https://www.honhai.com/csr-report.html',
      foundedYear: '2017',
      parentCompany: '鴻海集團',
      revenue: '約200億新台幣 (原計畫大幅縮減)'
    },
    'foxconn-ohio': {
      name: '鴻海精密工業股份有限公司 (俄亥俄廠)',
      englishName: 'Hon Hai Precision Industry Co., Ltd.',
      facilityId: 'US-FXN-002',
      facilityName: '俄亥俄電動車廠',
      facilityEnglishName: 'Ohio EV Manufacturing Facility',
      address: '2700 Hallock Young Rd, Lordstown, OH 44481, USA',
      industry: '電動車製造',
      employeeCount: '約2,000人',
      carbonEmissions: '0.4百萬噸 (2023)',
      reportUrl: 'https://www.honhai.com/csr-report.html',
      foundedYear: '2021',
      parentCompany: '鴻海集團',
      revenue: '約300億新台幣 (電動車業務)'
    },
    'tsmc-hsinchu': {
      name: '台灣積體電路製造股份有限公司 (新竹廠)',
      englishName: 'Taiwan Semiconductor Manufacturing Company Limited',
      facilityId: 'TW-TSMC-001',
      facilityName: '新竹科學園區',
      facilityEnglishName: 'Hsinchu Science Park',
      address: '新竹市東區力行六路8號',
      industry: '半導體製造',
      employeeCount: '約25,000人',
      carbonEmissions: '4.5百萬噸 (2023)',
      reportUrl: 'https://www.tsmc.com/sustainability-report.html',
      foundedYear: '1987',
      parentCompany: '台積電集團',
      revenue: '約8,700億新台幣 (總部及先進製程)',
      facilities: 'Fab 12A/12B, Fab 20 (2nm研發), 總部'
    },
    'tsmc-tainan': {
      name: '台灣積體電路製造股份有限公司 (台南廠)',
      englishName: 'Taiwan Semiconductor Manufacturing Company Limited',
      facilityId: 'TW-TSMC-002',
      facilityName: '台南科學園區',
      facilityEnglishName: 'Tainan Science Park',
      address: '台南市新市區南科三路26號',
      industry: '半導體製造',
      employeeCount: '約20,000人',
      carbonEmissions: '6.2百萬噸 (2023)',
      reportUrl: 'https://www.tsmc.com/sustainability-report.html',
      foundedYear: '1996',
      parentCompany: '台積電集團',
      revenue: '約1.2兆新台幣 (先進製程主力)',
      facilities: 'Fab 14, Fab 18 (5nm/3nm量產)'
    },
    'tsmc-taichung': {
      name: '台灣積體電路製造股份有限公司 (台中廠)',
      englishName: 'Taiwan Semiconductor Manufacturing Company Limited',
      facilityId: 'TW-TSMC-003',
      facilityName: '台中科學園區',
      facilityEnglishName: 'Taichung Science Park',
      address: '台中市大雅區科雅路8號',
      industry: '半導體製造',
      employeeCount: '約8,000人',
      carbonEmissions: '2.1百萬噸 (2023)',
      reportUrl: 'https://www.tsmc.com/sustainability-report.html',
      foundedYear: '2003',
      parentCompany: '台積電集團',
      revenue: '約3,800億新台幣',
      facilities: 'Fab 15 (超大晶圓廠)'
    },
    'tsmc-kaohsiung': {
      name: '台灣積體電路製造股份有限公司 (高雄廠)',
      englishName: 'Taiwan Semiconductor Manufacturing Company Limited',
      facilityId: 'TW-TSMC-004',
      facilityName: '高雄科學園區',
      facilityEnglishName: 'Kaohsiung Science Park',
      address: '高雄市楠梓區加昌路600號',
      industry: '半導體製造',
      employeeCount: '約12,000人 (建設中)',
      carbonEmissions: '預估3.5百萬噸 (滿載)',
      reportUrl: 'https://www.tsmc.com/sustainability-report.html',
      foundedYear: '2021',
      parentCompany: '台積電集團',
      revenue: '約5,500億新台幣 (預估滿載)',
      facilities: 'Fab 22 (2nm先進製程)'
    },
    'tsmc-arizona': {
      name: '台灣積體電路製造股份有限公司 (亞利桑那廠)',
      englishName: 'Taiwan Semiconductor Manufacturing Company Limited',
      facilityId: 'US-TSMC-001',
      facilityName: '亞利桑那廠',
      facilityEnglishName: 'Arizona Fab',
      address: '2701 W Ocotillo Rd, Phoenix, AZ 85339, USA',
      industry: '半導體製造',
      employeeCount: '約4,000人 (預計)',
      carbonEmissions: '預估年排放200萬噸',
      reportUrl: 'https://www.tsmc.com/sustainability-report.html',
      foundedYear: '2020',
      parentCompany: '台積電集團',
      revenue: '約2,000億新台幣 (預估)',
      facilities: 'Fab 21 (5nm/4nm/3nm製程)'
    },
    'tsmc-nanjing': {
      name: '台灣積體電路製造股份有限公司 (南京廠)',
      englishName: 'Taiwan Semiconductor Manufacturing Company Limited',
      facilityId: 'CN-TSMC-001',
      facilityName: '南京廠',
      facilityEnglishName: 'Nanjing Fab',
      address: '中國江蘇省南京市浦口區浦口大道1號',
      industry: '半導體製造',
      employeeCount: '約3,000人',
      carbonEmissions: '1.2百萬噸 (2023)',
      reportUrl: 'https://www.tsmc.com/sustainability-report.html',
      foundedYear: '2016',
      parentCompany: '台積電集團',
      revenue: '約800億新台幣',
      facilities: 'Fab 16 (16nm製程)'
    }
  };
  
  return facilitiesData[facilityId] || facilitiesData['nan-ya-plastics'];
};

// Helper to convert YYYYQTR to YYYY-MM-DD (start of quarter)
const convertYearQtrToDate = (yearQtr) => {
  if (!yearQtr || typeof yearQtr !== 'string' || yearQtr.length < 5) return 'N/A';
  const year = yearQtr.substring(0, 4);
  const quarter = yearQtr.substring(4, 5);
  let month;
  switch (quarter) {
    case '1': month = '01'; break;
    case '2': month = '04'; break;
    case '3': month = '07'; break;
    case '4': month = '10'; break;
    default: return `${year}-01-01`; // Fallback
  }
  return `${year}-${month}-01`;
};

// 獲取環境違規和罰款信息
export const getViolationData = async (companyId) => {
  const violationDataStore = {
    'nan-ya-plastics': [
      // Data from NAN_YA_PLASTICS_CAA_Violations_violations.csv
      {
        caseNumber: 'CAA-3600675654', // Added prefix for clarity
        date: '2015-10-26',
        type: 'Clean Air Act',
        description: 'State Implementation Plan for National Primary and Secondary Ambient Air Quality Standards - FACIL',
        status: 'Concluded', // Based on HPV_RESOLVED_DATE '10-26-2015'
        source: 'State Agency', // AGENCY_TYPE_DESC
        plantSite: 'Lake City, SC',
      },
      {
        caseNumber: 'CAA-3601384384',
        date: '2018-03-20',
        type: 'Clean Air Act',
        description: 'MACT Standards (40 CFR Part 63) - TOTAL HAZARDOUS AIR POLLUTANTS (HAPS)',
        status: 'Concluded', // Based on HPV_RESOLVED_DATE '08-20-2018'
        source: 'State Agency',
        plantSite: 'Lake City, SC',
      },

      // Data from NAN_YA_PLASTICS_CWA_Violations_violations.csv
      // Simplified due to lack of specific case numbers, descriptions, and status in source.
      // HLRNC codes (V,D,R,N,E,W,P) would ideally be mapped to meaningful status/descriptions.
      {
        caseNumber: 'CWA-110000353965-20164',
        date: convertYearQtrToDate('20164'),
        type: 'Clean Water Act',
        description: 'Compliance status: V (Violation)', // Using HLRNC code
        status: 'Unknown', // Status needs interpretation of HLRNC
        source: 'EPA Data',
        plantSite: 'Lake City, SC', // REGISTRY_ID 110000353965
      },
      {
        caseNumber: 'CWA-110000353965-20171',
        date: convertYearQtrToDate('20171'),
        type: 'Clean Water Act',
        description: 'Compliance status: V (Violation), 2 Violations This Qtr',
        status: 'Unknown',
        source: 'EPA Data',
        plantSite: 'Lake City, SC',
      },
      {
        caseNumber: 'CWA-110000353965-20193',
        date: convertYearQtrToDate('20193'),
        type: 'Clean Water Act',
        description: 'Compliance status: D (Violation)',
        status: 'Unknown',
        source: 'EPA Data',
        plantSite: 'Lake City, SC',
      },
      {
        caseNumber: 'CWA-110057188699-20141',
        date: convertYearQtrToDate('20141'),
        type: 'Clean Water Act',
        description: 'Compliance status: V (Violation)',
        status: 'Unknown',
        source: 'EPA Data',
        plantSite: 'Lake City, SC', // REGISTRY_ID 110057188699
      },
      {
        caseNumber: 'CWA-110057188699-20182',
        date: convertYearQtrToDate('20182'),
        type: 'Clean Water Act',
        description: 'Compliance status: E (Violation), 2 Violations This Qtr',
        status: 'Unknown',
        source: 'EPA Data',
        plantSite: 'Lake City, SC',
      },
      {
        caseNumber: 'CWA-110002066120-20192',
        date: convertYearQtrToDate('20192'),
        type: 'Clean Water Act',
        description: 'Compliance status: R (Reported Noncompliance), 3 Violations This Qtr',
        status: 'Unknown',
        source: 'EPA Data',
        plantSite: 'Batchelor, LA', // REGISTRY_ID 110002066120
      },
       {
        caseNumber: 'CWA-110002066120-20243',
        date: convertYearQtrToDate('20243'),
        type: 'Clean Water Act',
        description: 'Compliance status: V (Violation), 2 Violations This Qtr',
        status: 'Unknown',
        source: 'EPA Data',
        plantSite: 'Batchelor, LA',
      },
      // TODO: Add more parsed CWA records here if needed, following the pattern.
      // The CSV has many entries for CWA; this is a sample.

      // Data from NAN_YA_PLASTICS_RCRA_Violations_violations.csv
      {
        caseNumber: 'RCRA-110064116772-20190327-1',
        date: '2019-03-27',
        type: 'Resource Conservation and Recovery Act',
        description: 'State Statutory or Regulatory requirements that are broader-in-scope than the federal RCRA requirements',
        status: 'Concluded', // ACTUAL_RTC_DATE '04/24/2019'
        source: 'State Agency', // VIOL_DETERMINED_BY_AGENCY 'S'
        plantSite: 'Wharton, TX',
      },
      {
        caseNumber: 'RCRA-110000353965-20020829-1',
        date: '2002-08-29',
        type: 'Resource Conservation and Recovery Act',
        description: 'Standards Applicable to Generators of HW: General',
        status: 'Concluded', // ACTUAL_RTC_DATE '10/11/2002'
        source: 'State Agency',
        plantSite: 'Lake City, SC',
      },
      {
        caseNumber: 'RCRA-110064116772-20190327-2',
        date: '2019-03-27',
        type: 'Resource Conservation and Recovery Act',
        description: 'Standards Applicable to Recordkeeping and Reporting Applicable to Small and Large Quantity Generators',
        status: 'Concluded', // ACTUAL_RTC_DATE '04/24/2019'
        source: 'State Agency',
        plantSite: 'Wharton, TX',
      },
      {
        caseNumber: 'RCRA-110002066120-20050113-1',
        date: '2005-01-13',
        type: 'Resource Conservation and Recovery Act',
        description: 'Standards Applicable to Generators of HW: General',
        status: 'Concluded', // ACTUAL_RTC_DATE '03/10/2005'
        source: 'State Agency',
        plantSite: 'Batchelor, LA',
      },
      {
        caseNumber: 'RCRA-110002066120-20050113-2',
        date: '2005-01-13',
        type: 'Resource Conservation and Recovery Act',
        description: 'Standards Applicable to Generators of HW: Pre-Transport Requirements Applicable to Small and Large Quantity Generators',
        status: 'Concluded', // ACTUAL_RTC_DATE '01/13/2005'
        source: 'State Agency',
        plantSite: 'Batchelor, LA',
      },
    ],
    // Mock data for other companies remain unchanged
    'formosa-plastics-tx': [
        {
          caseNumber: 'TX-06-2017-0047',
          date: '2017-06-12',
          type: 'Clean Air Act',
          description: 'Violation of emission standards for hazardous air pollutants',
          status: 'Concluded',
          source: 'EPA Enforcement',
          plantSite: 'Point Comfort, TX', // Added for consistency
        },
        {
          caseNumber: 'TX-06-2019-0023',
          date: '2019-09-13',
          type: 'Clean Water Act',
          description: 'Discharge of plastic pellets into Lavaca Bay',
          status: 'Concluded',
          source: 'EPA Enforcement & State of Texas',
          plantSite: 'Point Comfort, TX',
        },
        {
          caseNumber: 'TX-06-2020-0011',
          date: '2020-03-15',
          type: 'Resource Conservation and Recovery Act',
          description: 'Improper storage of hazardous waste',
          status: 'Concluded',
          source: 'EPA Enforcement',
          plantSite: 'Point Comfort, TX',
        },
        {
          caseNumber: 'TX-06-2021-0034',
          date: '2021-11-08',
          type: 'Clean Air Act',
          description: 'Excess emissions during startup and shutdown events',
          status: 'Active',
          source: 'EPA Enforcement',
          plantSite: 'Point Comfort, TX',
        },
        {
          caseNumber: 'TX-06-2022-0018',
          date: '2022-07-22',
          type: 'Clean Water Act',
          description: 'Unauthorized discharge of wastewater',
          status: 'Active',
          source: 'EPA Enforcement',
          plantSite: 'Point Comfort, TX',
        }
      ],
      'formosa-plastics-tw': [
        {
          caseNumber: 'TW-FPC-2020-001',
          date: '2020-04-18',
          type: '空氣污染防制法',
          description: '揮發性有機物排放超標',
          status: 'Concluded',
          source: '環保署',
          plantSite: '麥寮廠, 台灣', // Added for consistency
        },
        {
          caseNumber: 'TW-FPC-2021-003',
          date: '2021-07-05',
          type: '水污染防治法',
          description: '廢水處理設施故障導致污水排放',
          status: 'Concluded',
          source: '環保署',
          plantSite: '麥寮廠, 台灣',
        }
      ],
      'evergreen-marine': [
        {
          caseNumber: 'TW-EMC-2021-001',
          date: '2021-09-30',
          type: '海洋污染防治法',
          description: '船舶廢油未妥善處理',
          status: 'Concluded',
          source: '海洋委員會',
          plantSite: '台北總部, 台灣', // Added for consistency
        }
      ],
      'china-steel': [
        {
          caseNumber: 'TW-CSC-2018-003',
          date: '2018-05-22',
          type: '空氣污染防制法',
          description: '粒狀污染物排放超標',
          status: 'Concluded',
          source: '環保署',
          plantSite: '高雄廠, 台灣', // Added for consistency
        },
        {
          caseNumber: 'TW-CSC-2019-001',
          date: '2019-08-14',
          type: '空氣污染防制法',
          description: '硫氧化物排放超標',
          status: 'Concluded',
          source: '環保署',
          plantSite: '高雄廠, 台灣',
        },
        {
          caseNumber: 'TW-CSC-2021-002',
          date: '2021-03-28',
          type: '水污染防治法',
          description: '重金屬廢水排放超標',
          status: 'Concluded',
          source: '環保署',
          plantSite: '高雄廠, 台灣',
        },
        {
          caseNumber: 'TW-CSC-2022-001',
          date: '2022-11-05',
          type: '空氣污染防制法',
          description: '氮氧化物排放超標',
          status: 'Active',
          source: '環保署',
          plantSite: '高雄廠, 台灣',
        }
      ],
      'foxconn-tucheng': [
        {
          caseNumber: 'TW-FXN-2023-001',
          date: '2023-04-10',
          type: '投資管理法',
          description: '未經許可投資中國大陸企業紫光集團',
          status: 'Concluded',
          source: '經濟部投審會',
          plantSite: '土城總部, 台灣',
          fine: 'NT$10,000,000'
        }
      ],
      'foxconn-shenzhen': [
        {
          caseNumber: 'CN-FXN-2013-001',
          date: '2013-08-04',
          type: '水污染防治法',
          description: '排放含鎳、銅重金屬黑綠色廢水至上海黃浦江支流',
          status: 'Concluded',
          source: '中國環保團體指控',
          plantSite: '深圳龍華廠, 中國',
          fine: '未知'
        },
        {
          caseNumber: 'CN-FXN-2011-001',
          date: '2011-03-20',
          type: '職業健康安全法',
          description: '員工工作環境導致健康問題，引發一系列自殺事件',
          status: 'Concluded',
          source: '深圳市政府',
          plantSite: '深圳龍華廠, 中國',
          fine: '改善承諾'
        },
        {
          caseNumber: 'CN-FXN-2022-001',
          date: '2022-12-04',
          type: '稅務調查',
          description: '中國對富士康進行稅務調查（政治因素）',
          status: 'Under Investigation',
          source: '深圳稅務局',
          plantSite: '深圳龍華廠, 中國',
          fine: '調查中'
        }
      ],
      'foxconn-zhengzhou': [
        {
          caseNumber: 'CN-FXN-2024-001',
          date: '2024-01-15',
          type: '安全生產法',
          description: '千年一遇洪災應對不當，影響380人死亡或失蹤',
          status: 'Under Review',
          source: '河南省應急管理廳',
          plantSite: '鄭州航空港廠, 中國',
          fine: '調查中'
        }
      ],
      'foxconn-taiyuan': [
        {
          caseNumber: 'CN-FXN-2011-002',
          date: '2011-05-15',
          type: '空氣污染防制法',
          description: '工廠排放刺激性氣體，導致村民咳嗽、頭痛、呼吸困難',
          status: 'Concluded',
          source: '太原市環保局',
          plantSite: '太原科技園, 中國',
          fine: '整改要求'
        },
        {
          caseNumber: 'CN-FXN-2012-001',
          date: '2012-09-20',
          type: '環境保護法',
          description: '塗裝車間、廢水處理設施污染排放超標',
          status: 'Concluded',
          source: '山西省環保廳',
          plantSite: '太原科技園, 中國',
          fine: '人民幣50,000元'
        }
      ],
      'foxconn-wisconsin': [
        {
          caseNumber: 'US-FXN-2018-001',
          date: '2018-04-20',
          type: 'Environmental Review',
          description: '獲得州級環評及濕地許可全面豁免',
          status: 'Approved',
          source: 'Wisconsin State Legislature',
          plantSite: '威斯康辛科技園, 美國',
          fine: 'N/A (Exemption Granted)'
        },
        {
          caseNumber: 'US-FXN-2019-001',
          date: '2019-06-15',
          type: 'Great Lakes Protection Act',
          description: '每日700萬加侖密西根湖取水爭議',
          status: 'Approved by Court',
          source: 'Wisconsin State Court',
          plantSite: '威斯康辛科技園, 美國',
          fine: 'N/A (Court Approved)'
        }
      ],
      'foxconn-ohio': [
        {
          caseNumber: 'US-FXN-2008-001',
          date: '2008-06-15',
          type: 'Clean Air Act',
          description: '進口不符空氣污染標準鏈鋸',
          status: 'Concluded',
          source: 'EPA/DOJ',
          plantSite: '俄亥俄電動車廠, 美國',
          fine: '$2,000,000'
        }
      ],
      'tsmc-hsinchu': [
        {
          caseNumber: 'TW-TSMC-2021-001',
          date: '2021-01-15',
          type: '水污染防治法',
          description: '廢水處理違規',
          status: 'Concluded',
          source: '新竹縣環保局',
          plantSite: '新竹科學園區, 台灣',
          fine: 'NT$27,000'
        },
        {
          caseNumber: 'TW-TSMC-2021-002',
          date: '2021-01-20',
          type: '空氣污染防制法',
          description: '空氣污染防制違規',
          status: 'Concluded',
          source: '新竹縣環保局',
          plantSite: '新竹科學園區, 台灣',
          fine: 'NT$100,000'
        },
        {
          caseNumber: 'TW-TSMC-2017-001',
          date: '2017-02-08',
          type: '廢棄物清理法',
          description: '廢棄物處理違規',
          status: 'Concluded',
          source: '新竹縣環保局',
          plantSite: '新竹科學園區, 台灣',
          fine: 'NT$6,000'
        }
      ],
      'tsmc-taichung': [
        {
          caseNumber: 'TW-TSMC-2016-001',
          date: '2016-10-12',
          type: '空氣污染防制法',
          description: '空氣污染防制設施違規',
          status: 'Concluded',
          source: '台中市環保局',
          plantSite: '台中科學園區, 台灣',
          fine: 'NT$100,000'
        }
      ],
      'tsmc-tainan': [
        {
          caseNumber: 'TW-TSMC-2022-001',
          date: '2022-12-03',
          type: '毒性及關注化學物質管理法',
          description: '化學物質儲存量申報不實',
          status: 'Concluded',
          source: '台南市環保局',
          plantSite: '台南科學園區, 台灣',
          fine: 'NT$50,000'
        }
      ],
      'tsmc-kaohsiung': [
        {
          caseNumber: 'TW-TSMC-2024-002',
          date: '2024-03-04',
          type: '環境影響評估法',
          description: '2奈米廠環評程序爭議',
          status: 'Under Review',
          source: '環保署',
          plantSite: '高雄科學園區, 台灣',
          fine: 'N/A (行政程序)'
        }
      ],
      'tsmc-arizona': [
        {
          caseNumber: 'US-TSMC-2024-001',
          date: '2024-08-15',
          type: 'OSHA Safety Violation',
          description: '工安違規事件',
          status: 'Concluded',
          source: 'OSHA',
          plantSite: 'Phoenix, Arizona, USA',
          fine: '$16,131'
        },
        {
          caseNumber: 'US-TSMC-2025-001',
          date: '2025-04-08',
          type: 'Export Control Violation',
          description: '通過Sophgo間接為華為製造晶片，違反出口管制',
          status: 'Under Investigation',
          source: 'US Commerce Department',
          plantSite: 'Phoenix, Arizona, USA',
          fine: '可能超過$1,000,000,000'
        }
      ],
      'tsmc-nanjing': [
        {
          caseNumber: 'CN-TSMC-2018-001',
          date: '2018-09-20',
          type: '環境保護法',
          description: '製程廢氣排放檢測異常',
          status: 'Concluded',
          source: '南京市環保局',
          plantSite: '南京廠, 中國',
          fine: '人民幣15,000元'
        }
      ]
  };
  
  if (companyId && violationDataStore[companyId]) {
    return violationDataStore[companyId];
  }
  // If specifically asking for nan-ya-plastics, or if no specific ID (though UI should pass one)
  if (companyId === 'nan-ya-plastics') {
     return violationDataStore['nan-ya-plastics'];
  }
  return []; // Default to empty if companyId is not found
};

// 獲取相關新聞
export const getRelatedNews = async (companyId) => {
  const newsData = {
    // ... (existing news data for other companies, ensure they also have plantSite if applicable)
    'formosa-plastics-tx': {
      international: [
        { title: 'Reuters: Formosa Plastics fined $50 million for Clean Water Act violations', date: '2019-10-15', source: 'Reuters', url: '#', plantSite: 'Point Comfort, TX' },
        { title: 'Bloomberg: Formosa Plastics Texas plant explosion injures several workers', date: '2021-05-03', source: 'Bloomberg', url: '#', plantSite: 'Point Comfort, TX' },
      ],
      domestic: [
        { title: 'Texas Tribune: Environmental groups sue Formosa over plastic pellet discharge', date: '2017-08-22', source: 'Texas Tribune', url: '#', plantSite: 'Point Comfort, TX' },
      ],
    },
    'nan-ya-plastics': { 
      international: [
        { title: 'Chemical & Engineering News: Nan Ya USA expands PET film capacity in South Carolina', date: '2018-07-19', source: 'C&EN', url: '#', plantSite: 'Lake City, SC'},
        { title: 'Plastics News: Nan Ya Plastics invests in new equipment for Wharton, TX facility', date: '2022-03-10', source: 'Plastics News', url: '#', plantSite: 'Wharton, TX'},
        { title: 'Global Chemical Report: Nan Ya\'s Batchelor LA site meets new environmental targets', date: '2023-01-15', source: 'Global Chemical Report', url: '#', plantSite: 'Batchelor, LA'},
        { title: 'Reuters: Nan Ya Plastics considers further expansion in US market', date: '2023-05-20', source: 'Reuters', url: '#', plantSite: 'All US Sites (General)' } 
      ],
      domestic: [ 
        { title: 'The State: Nan Ya Plastics plant in Lake City, SC faces scrutiny over air permits', date: '2019-05-01', source: 'The State', url: '#', plantSite: 'Lake City, SC'},
        { title: 'SCNow: Nan Ya USA recognized for community involvement in Florence County', date: '2022-11-15', source: 'SCNow', url: '#', plantSite: 'Lake City, SC'},
        { title: 'Baton Rouge Business Report: Nan Ya Louisiana facility announces job creation', date: '2021-08-03', source: 'Baton Rouge Business Report', url: '#', plantSite: 'Batchelor, LA'},
        { title: 'Pointe Coupee Banner: Local officials praise Nan Ya Batchelor\'s safety record', date: '2023-02-20', source: 'Pointe Coupee Banner', url: '#', plantSite: 'Batchelor, LA'},
        { title: 'Wharton Journal-Spectator: Nan Ya Texas contributes to local STEM education program', date: '2022-09-01', source: 'Wharton Journal-Spectator', url: '#', plantSite: 'Wharton, TX'},
        { title: 'Houston Chronicle: Manufacturing growth in Texas, Nan Ya Wharton plant highlighted', date: '2023-03-28', source: 'Houston Chronicle', url: '#', plantSite: 'Wharton, TX'}
      ],
    },
     'formosa-plastics-tw': {
      international: [
         { title: 'Focus Taiwan: Formosa Plastics Group invests in US expansion despite environmental concerns', date: '2023-01-20', source: 'Focus Taiwan', url: '#', plantSite: '台灣總部參考'},
      ],
      domestic: [
        { title: '經濟日報: 台塑麥寮廠區推動綠色製造獲肯定', date: '2022-10-10', source: '經濟日報', url: '#', plantSite: '麥寮廠, 台灣' },
      ],
    },
    'evergreen-marine': {
      international: [
        { title: 'Lloyd\'s List: Evergreen orders new eco-friendly container ships', date: '2023-03-15', source: 'Lloyd\'s List', url: '#', plantSite: '全球營運'},
      ],
      domestic: [
        { title: '中央社: 長榮海運公布最新永續發展報告書', date: '2023-06-01', source: '中央社', url: '#', plantSite: '台北總部, 台灣'},
      ],
    },
    'china-steel': {
      international: [
        { title: 'Metal Bulletin: China Steel faces rising raw material costs', date: '2023-02-25', source: 'Metal Bulletin', url: '#', plantSite: '全球市場影響'},
      ],
      domestic: [
        { title: '工商時報: 中鋼投入智慧製造，提升高雄廠效率與環保', date: '2022-12-05', source: '工商時報', url: '#', plantSite: '高雄廠, 台灣'},
      ],
    },
    'foxconn-tucheng': {
      international: [
        { title: 'Financial Times: Hon Hai faces regulatory scrutiny over mainland investments', date: '2023-04-15', source: 'Financial Times', url: '#', plantSite: '土城總部, 台灣'},
      ],
      domestic: [
        { title: '經濟日報: 鴻海土城總部推動綠色辦公獲環保認證', date: '2023-09-05', source: '經濟日報', url: '#', plantSite: '土城總部, 台灣'},
        { title: '工商時報: 鴻海總部宣布2040年RE100目標', date: '2023-05-20', source: '工商時報', url: '#', plantSite: '土城總部, 台灣'},
      ],
    },
    'foxconn-shenzhen': {
      international: [
        { title: 'China Digital Times: Foxconn Accused of Wastewater Pollution', date: '2013-08-04', source: 'China Digital Times', url: 'http://chinadigitaltimes.net/2013/08/foxconn-accused-of-wastewater-pollution/', plantSite: '深圳龍華廠, 中國'},
        { title: 'Business & Human Rights: Apple attacked over pollution in China', date: '2011-09-01', source: 'Business & Human Rights', url: 'https://www.business-humanrights.org/en/latest-news/apple-attacked-over-pollution-in-china/', plantSite: '深圳龍華廠, 中國'},
        { title: 'Reuters: Foxconn Shenzhen plant faces labor and environmental challenges', date: '2012-03-20', source: 'Reuters', url: '#', plantSite: '深圳龍華廠, 中國'},
      ],
      domestic: [
        { title: '中央廣播電台: 富士康遭查稅歷來重點台企被罰難脫政治因素', date: '2022-12-04', source: '中央廣播電台', url: 'https://www.rti.org.tw/news?uid=3&pid=67145', plantSite: '深圳龍華廠, 中國'},
        { title: '南方都市報: 深圳富士康龍華廠區升級環保設施', date: '2023-07-12', source: '南方都市報', url: '#', plantSite: '深圳龍華廠, 中國'},
      ],
    },
    'foxconn-zhengzhou': {
      international: [
        { title: 'The Diplomat: Apple Must Clean up Its Polluting Supply Chain, Starting with Foxconn', date: '2024-01-15', source: 'The Diplomat', url: 'https://thediplomat.com/2024/01/apple-must-clean-up-its-polluting-supply-chain-starting-with-foxconn/', plantSite: '鄭州航空港廠, 中國'},
        { title: 'Wall Street Journal: Foxconn Zhengzhou facility hit by flood concerns', date: '2024-02-20', source: 'Wall Street Journal', url: '#', plantSite: '鄭州航空港廠, 中國'},
      ],
      domestic: [
        { title: '河南日報: 富士康鄭州廠iPhone產能創新高', date: '2023-10-15', source: '河南日報', url: '#', plantSite: '鄭州航空港廠, 中國'},
        { title: '大河報: 鄭州富士康應對洪災考驗顯現風險管理問題', date: '2024-01-20', source: '大河報', url: '#', plantSite: '鄭州航空港廠, 中國'},
      ],
    },
    'foxconn-taiyuan': {
      international: [
        { title: 'Bloomberg: Foxconn Taiyuan plant faces pollution allegations', date: '2012-08-15', source: 'Bloomberg', url: '#', plantSite: '太原科技園, 中國'},
      ],
      domestic: [
        { title: '山西日報: 太原富士康空氣污染問題持續引發關注', date: '2012-06-20', source: '山西日報', url: '#', plantSite: '太原科技園, 中國'},
        { title: '太原晚報: 富士康太原廠區環保整改進展報告', date: '2013-03-10', source: '太原晚報', url: '#', plantSite: '太原科技園, 中國'},
      ],
    },
    'foxconn-wisconsin': {
      international: [
        { title: 'The Badger Herald: Murky waters: Foxconn deal brings economic opportunity, environmental concerns', date: '2017-10-25', source: 'The Badger Herald', url: 'https://badgerherald.com/features/2017/10/25/murky-waters-foxconn-deal-brings-economic-opportunity-environmental-concerns/', plantSite: '威斯康辛科技園, 美國'},
        { title: 'Urban Milwaukee: Murphy\'s Law: How Foxconn Will Pollute Wisconsin', date: '2018-04-03', source: 'Urban Milwaukee', url: 'https://urbanmilwaukee.com/2018/04/03/murphys-law-how-foxconn-will-pollute-wisconsin/', plantSite: '威斯康辛科技園, 美國'},
        { title: 'FLOW Water Advocates: Wisconsin judge upholds Foxconn decision', date: '2019-06-15', source: 'FLOW Water Advocates', url: 'https://flowwateradvocates.org/wisconsin-judge-upholds-foxconn-decision-undermining-the-compact-designed-to-prevent-great-lakes-diversions/', plantSite: '威斯康辛科技園, 美國'},
      ],
      domestic: [
        { title: 'Milwaukee Journal Sentinel: Foxconn Wisconsin project scale dramatically reduced', date: '2020-04-20', source: 'Milwaukee Journal Sentinel', url: '#', plantSite: '威斯康辛科技園, 美國'},
        { title: 'Wisconsin State Journal: Environmental impact of scaled-back Foxconn project questioned', date: '2021-08-15', source: 'Wisconsin State Journal', url: '#', plantSite: '威斯康辛科技園, 美國'},
      ],
    },
    'foxconn-ohio': {
      international: [
        { title: 'Automotive News: Foxconn Ohio EV plant ramps up production', date: '2023-09-12', source: 'Automotive News', url: '#', plantSite: '俄亥俄電動車廠, 美國'},
      ],
      domestic: [
        { title: 'EPA: Taiwanese and US companies settle Clean Air violations', date: '2008-06-15', source: 'EPA', url: 'https://www.epa.gov/enforcement/taiwanese-and-us-companies-settle-clean-air-violations', plantSite: '俄亥俄電動車廠, 美國'},
        { title: 'Cleveland Plain Dealer: Lordstown plant transformation under Foxconn ownership', date: '2022-11-30', source: 'Cleveland Plain Dealer', url: '#', plantSite: '俄亥俄電動車廠, 美國'},
      ],
    },
    'tsmc-hsinchu': {
      international: [
        { title: 'Reuters: TSMC could face $1 billion or more fine from US probe', date: '2025-04-08', source: 'Reuters', url: 'https://www.reuters.com/technology/tsmc-could-face-1-billion-or-more-fine-us-probe-sources-say-2025-04-08/', plantSite: '新竹總部, 台灣'},
        { title: 'Al Jazeera: Taiwan struggles to reconcile climate ambitions and chip manufacturing', date: '2024-12-24', source: 'Al Jazeera', url: 'https://www.aljazeera.com/economy/2024/12/25/taiwan-struggles-to-reconcile-climate-ambitions-and-chip-manufacturing', plantSite: '新竹科學園區, 台灣'},
      ],
      domestic: [
        { title: '透明足跡: 台積電環境違規記錄公開', date: '2021-01-30', source: '透明足跡', url: 'https://thaubing.gcaa.org.tw/corp/22099131', plantSite: '新竹科學園區, 台灣'},
        { title: '經濟日報: 台積電新竹廠區獲頒綠色製造標章', date: '2023-11-08', source: '經濟日報', url: '#', plantSite: '新竹科學園區, 台灣'},
      ],
    },
    'tsmc-tainan': {
      international: [
        { title: 'Bloomberg: Taiwan Semiconductor achieves renewable energy milestone', date: '2023-08-15', source: 'Bloomberg', url: '#', plantSite: '台南科學園區, 台灣'},
      ],
      domestic: [
        { title: '工商時報: 台積電台南廠投入循環經濟，減少廢棄物排放', date: '2023-09-22', source: '工商時報', url: '#', plantSite: '台南科學園區, 台灣'},
        { title: '中央社: 台積電發佈2023年永續報告書，承諾2050年淨零排放', date: '2023-06-30', source: '中央社', url: '#', plantSite: '台南科學園區, 台灣'},
      ],
    },
    'tsmc-kaohsiung': {
      international: [
        { title: 'Financial Times: TSMC Kaohsiung fab faces water supply challenges', date: '2024-05-15', source: 'Financial Times', url: '#', plantSite: '高雄科學園區, 台灣'},
      ],
      domestic: [
        { title: 'TaiwanPlus News: Environmental Concerns Over TSMC\'s 2-nm Kaohsiung Fab', date: '2024-03-04', source: 'TaiwanPlus News', url: 'https://www.youtube.com/watch?v=pfZXeNL3Egs', plantSite: '高雄科學園區, 台灣'},
        { title: '聯合報: 台積電高雄廠2奈米製程環評爭議持續', date: '2024-04-12', source: '聯合報', url: '#', plantSite: '高雄科學園區, 台灣'},
      ],
    },
    'tsmc-arizona': {
      international: [
        { title: 'Xinhua News: Major chipmakers criticized for posing health risks to minority communities', date: '2024-08-26', source: 'Xinhua News', url: 'https://english.news.cn/20240826/255599d1eaac4e46a8e0bce3d0f6c6af/c.html', plantSite: 'Phoenix, Arizona, USA'},
        { title: 'InBusiness Phoenix: Arizona\'s Semiconductor Boom Sparks Environmental Concerns', date: '2024-09-29', source: 'InBusiness Phoenix', url: 'https://inbusinessphx.com/technology-innovation/arizonas-semiconductor-boom-sparks-environmental-concerns', plantSite: 'Phoenix, Arizona, USA'},
        { title: 'Wall Street Journal: TSMC Arizona faces water scarcity challenges', date: '2024-11-20', source: 'Wall Street Journal', url: '#', plantSite: 'Phoenix, Arizona, USA'},
      ],
      domestic: [
        { title: 'Arizona Republic: TSMC Phoenix construction creates local job opportunities', date: '2024-07-15', source: 'Arizona Republic', url: '#', plantSite: 'Phoenix, Arizona, USA'},
        { title: 'Phoenix Business Journal: Environmental groups challenge TSMC water usage permits', date: '2024-08-30', source: 'Phoenix Business Journal', url: '#', plantSite: 'Phoenix, Arizona, USA'},
      ],
    },
    'tsmc-nanjing': {
      international: [
        { title: 'South China Morning Post: TSMC Nanjing facility under US-China tech tensions', date: '2023-12-08', source: 'SCMP', url: '#', plantSite: '南京廠, 中國'},
      ],
      domestic: [
        { title: '新華日報: 台積電南京廠16奈米製程穩定營運', date: '2023-10-25', source: '新華日報', url: '#', plantSite: '南京廠, 中國'},
      ],
    }
  };
  
  if (companyId && newsData[companyId]) {
    // Combine all news categories for the selected company if they exist
    const companyNews = newsData[companyId];
    let allNews = { international: [], domestic: [] };
    if (companyNews.international) allNews.international = [...allNews.international, ...companyNews.international];
    if (companyNews.domestic) allNews.domestic = [...allNews.domestic, ...companyNews.domestic];
    
    // Filter out duplicates if any by URL (simple check)
    allNews.international = allNews.international.filter((v,i,a)=>a.findIndex(t=>(t.url === v.url && t.title === v.title))===i);
    allNews.domestic = allNews.domestic.filter((v,i,a)=>a.findIndex(t=>(t.url === v.url && t.title === v.title))===i);

    return allNews;
  }
  return { international: [], domestic: [] };
};


// This function attempts to fetch real data but is not currently used by the main UI flow
// which relies on the mocked getCompanyBasicInfo, getViolationData, getRelatedNews.
export const fetchEchoEnforcementData = async (facilityId) => {
  if (!facilityId) {
    console.error("Facility ID is required to fetch ECHO enforcement data.");
    return null;
  }

  // Example: Constructing a QCR (Quarterly Compliance Report) URL, adjust as needed
  // This specific service might require more specific parameters based on what data you need.
  // The `qid` (Query ID) is often generated by a prior query.
  // For direct facility lookup, you might need a different ECHO service or parameters.
  // This is a placeholder for a more complex API interaction.
  
  // Let's try to get facility info first to see if we can link to cases
  // Using a simplified search based on registry ID if facilityId is one
  // Note: ECHO services are numerous and complex. This is a very basic example.
  const facilityInfoUrl = `${ECHO_API_BASE}/echo_rest_services.get_facility_info?output=JSON&p_id=${facilityId}`;

  try {
    const response = await axios.get(facilityInfoUrl);
    if (response.data && response.data.Results && response.data.Results.Facilities) {
      // Further calls would be needed to get specific enforcement cases using IDs from facility info
      // For now, just returning the facility info found
      return response.data.Results.Facilities;
    } else {
      console.log("No facilities found or unexpected API response structure from get_facility_info.");
      return null;
    }
  } catch (error) {
    console.error('Error fetching data from ECHO API:', error.message);
    if (error.response) {
      console.error('ECHO API Response Error Data:', error.response.data);
      console.error('ECHO API Response Error Status:', error.response.status);
    }
    return null;
  }
}; 