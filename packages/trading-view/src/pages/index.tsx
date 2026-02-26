import { observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'

import Loading from '@/components/loading'
import { BASE_PATH, isProd } from '@/constants'
import { useConfig } from '@/context/configProvider'
import { useStores } from '@/context/mobxProvider'
import { ThemeConst } from '@/theme/theme'
import { symbolInfoArr } from '@/utils/wsUtil'

const TVChart = dynamic(() => import('@/components/TVChart').then((mod) => mod.TVChart), { ssr: false })

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
      {!isProd && (
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
        strategy="lazyOnload"
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
