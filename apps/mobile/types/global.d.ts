declare global {
  type Nilable<T> = T | undefined | null

  type CanWrite<T> = {
    -readonly [K in keyof T]: T[K] extends Record<any, any> ? CanWrite<T[K]> : T[K]
  }

  type Prettify<T> = {
    [K in keyof T]: T[K]
  } & {}

  type MaybeArray<T> = T | T[]

  type DeepRequired<T> = T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { [P in keyof T]-?: DeepRequired<Required<T[P]>> }
      : T

  type DeepOverride<T, U> = {
    [K in keyof T]: K extends keyof U
      ? U[K] extends Record<string, unknown>
        ? T[K] extends Record<string, unknown>
          ? DeepOverride<T[K], U[K]>
          : U[K]
        : U[K]
      : T[K]
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      EXPO_PUBLIC_PRIVY_APP_ID: string
      EXPO_PUBLIC_PRIVY_CLIENT_ID: string
      EXPO_PUBLIC_PRIVY_SESSION_SIGNER_ID: string
      EXPO_PUBLIC_API_BASE_URL: string
      EXPO_PUBLIC_IMAGE_DOMAIN: string
      EXPO_PUBLIC_WS_URL: string
    }
  }

  interface Window {
    TradingView: typeof TradingView
  }
}

export {}
