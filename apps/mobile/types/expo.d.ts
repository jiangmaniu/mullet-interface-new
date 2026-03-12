export type ExpoConfigExtra = {
  // Privy 配置
  PRIVY_APP_ID: string
  PRIVY_CLIENT_ID: string
  PRIVY_SESSION_SIGNER_ID: string
  // API 配置
  API_BASE_URL: string
  WS_URL: string
  IMG_DOMAIN: string
  WEBSITE_URL: string
  DEPOSIT_API_BASE_URL: string
  // Reown 配置
  REOWN_PROJECT_ID: string
  // Solana 网络配置
  SOLANA_CLUSTER: 'devnet' | 'testnet' | 'mainnet-beta'
  // 版本和环境信息
  APP_VERSION: string
  APP_ENV: string
  BUILD_TIME: string
}
