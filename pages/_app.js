import { ChakraProvider } from '@chakra-ui/react';
import theme from '../lib/theme';
import Head from 'next/head';
import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // 處理 GitHub Pages 上的 SPA 路由
    // 檢查 URL 是否包含重定向信息
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    
    // 如果存在重定向路徑，則導航到該路徑
    if (redirect && redirect !== location.href) {
      router.replace(redirect);
    }
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>GreenWatchAI - 企業環境監測平台</title>
        <meta name="description" content="追蹤企業環境績效和違規紀錄的平台" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // 檢查是否是從 404 頁面重定向過來的
            (function() {
              var redirect = window.location.search.match(/\\?\\/(.*)/);
              if (redirect && redirect.length > 1) {
                var path = redirect[1];
                history.replaceState(null, null, '/' + path);
                sessionStorage.redirect = '/' + path;
              }
            })();
          `
        }} />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp; 