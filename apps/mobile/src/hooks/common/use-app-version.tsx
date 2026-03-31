import { useMemo } from 'react'

import { EXPO_ENV_CONFIG } from '@/constants/expo'

export const useAppCurrentVersion = () => {
  const { APP_VERSION: version } = EXPO_ENV_CONFIG

  // 根据环境生成完整版本号：v{version}-{env} ({buildTime})
  const appCurrentVersion = useMemo(() => {
    const { APP_VERSION: version, APP_ENV: env, BUILD_TIME: buildTime } = EXPO_ENV_CONFIG
    const versionStr = env === 'prod' ? `v${version}` : `v${version}-${env} (${buildTime})`
    return `${versionStr}`
  }, [])

  return { appCurrentVersion, appCurrentRawVersion: version }
}
