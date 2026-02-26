// @ts-nocheck
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* 在 <head> 中注入阻塞脚本，浏览器绘制任何内容之前就设置背景色 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=new URLSearchParams(location.search);var t=p.get('theme');var d=t==='dark';document.documentElement.style.backgroundColor=d?'#060717':'#fff';document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})()`
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
