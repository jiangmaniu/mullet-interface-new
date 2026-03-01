import { observer } from 'mobx-react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'

import Loading from '@/components/loading'
import { TVChart } from '@/components/tv-chart'
import { symbolInfoArr } from '@/config/symbols'
import { BASE_PATH } from '@/constants'
import { useConfig } from '@/context/config-provider'
import { useStores } from '@/context/mobx-provider'
import { ThemeConst } from '@/theme/theme'

export default observer(() => {
  const [error, showError] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const { isMobile } = useConfig()
  const { ws } = useStores()
  const { query } = useRouter()
  const loading = ws.loading

  useEffect(() => {
    if (query.name) {
      if (!symbolInfoArr.some((v) => v.name === query.name) && !isMobile) {
        showError(true)
        return
      }
      // 展示图表
      setShowChart(true)
    }
  }, [query, isMobile])

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {`Params Error: symbol [${query.name}] not exist`}
      </div>
    )
  }

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
          {loading && <Loading />}
          {isScriptReady && showChart && <TVChart />}
        </div>
      )}
    </>
  )
})
