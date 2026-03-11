import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'

import { TVChart } from '@/components/tv-chart'
import { BASE_PATH } from '@/constants'
import { useConfig } from '@/context/config-provider'
import { ThemeConst } from '@/theme/theme'

export default function Home() {
  const [showChart, setShowChart] = useState(false)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const { isMobile } = useConfig()
  const { query } = useRouter()

  useEffect(() => {
    if (query.name) {
      setShowChart(true)
    }
  }, [query, isMobile])

  return (
    <>
      {query.debug === '1' && (
        <Script
          src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"
          strategy="afterInteractive"
          onReady={() => {
            // @ts-ignore
            new window.VConsole()
          }}
        />
      )}
      <Script
        src={`${BASE_PATH || '.'}/static/datafeeds/udf/dist/bundle.js`}
        strategy="afterInteractive"
        onReady={() => {
          setIsScriptReady(true)
        }}
      />
      {query.name && (
        <div
          style={{
            backgroundColor: query.theme === 'dark' ? ThemeConst.black : ThemeConst.white,
            height: '100vh'
          }}
        >
          {isScriptReady && showChart && <TVChart />}
        </div>
      )}
    </>
  )
}
