/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 使用自定義域名時，不需要設置 basePath
  basePath: '',
  // 禁用圖像優化，因為靜態導出不支持
  images: {
    unoptimized: true,
  },
  // 使用自定義域名時，不需要設置 assetPrefix
  assetPrefix: '',
  // 禁用字體優化以避免內嵌 CSS
  optimizeFonts: false,
};

module.exports = nextConfig; 