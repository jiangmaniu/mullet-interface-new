export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}
export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '//172.31.27.8:8000/trade-core'
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        )
        return formData
      }, new FormData())
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}

// 登录参数
type LoginParams = {
  username?: string
  password?: string
  phoneAreaCode?: string
  /**刷新token */
  refresh_token?: string
  /**租户ID：默认值 000000 */
  tenanId?: string
  /**登录传的类型，账户密码登录传account */
  type?: 'account'
  grant_type?: 'captcha' | 'password' | 'refresh_token' | 'privy_token'
  /**验证码 */
  captchaCode?: string
  scope?: 'all'
}

// 登录返回结果
type LoginResult = Partial<{
  /**token */
  access_token: string
  /**token类型 headers['Authentication'] = 'Bearer ' + token */
  token_type: string
  refresh_token: string
  expires_in: number
  scope: string
  tenant_id: string
  user_name: string
  real_name: string
  avatar: string
  client_id: string
  role_name: string
  license: string
  post_id: string
  user_id: string
  role_id: string
  nick_name: string
  oauth_id: string
  detail: { type: string }
  dept_id: string
  account: string
  jti: string
  success?: boolean
  /**接口防重放秘钥 */
  app_key?: string
}>

/**
 * R«PoolManage对象»
 * 返回信息
 */
export interface RLoginResult {
  /**
   * 状态码
   * @format int32
   */
  code: number
  /** 承载数据 */
  data?: LoginResult
  /** 返回消息 */
  msg: string
  /** 是否成功 */
  success: boolean
}

export namespace OAuth {
  /**
   * @description 传入accountGroup
   * @tags 交易账户组接口
   * @name PostAccountGroupAdd
   * @summary 交易账户组-新增
   * @request POST:/coreApi/accountGroup/add
   * @secure
   */
  export namespace PostToken {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = LoginParams
    export type RequestHeaders = {}
    export type ResponseBody = RLoginResult
  }
}

/**
 * @title BladeX 接口文档系统
 * @version 3.3.1.RELEASE
 * @license Powered By BladeX (https://bladex.cn)
 * @termsOfService https://bladex.cn
 * @baseUrl //172.31.27.8:8000/trade-core
 * @contact 翼宿 <bladejava@qq.com> (https://gitee.com/smallc)
 *
 * BladeX 接口文档系统
 */
export class BladeAuthApi<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http
  }

  oauth = {
    /**
     * @description 传入id
     *
     * @tags 交易品种接口
     * @name PostSymbolsRemove
     * @summary 交易品种-删除
     * @request POST:/coreApi/symbols/remove
     * @secure
     */
    postToken: (
      query?: {
        uername?: string
        password?: string
        phoneAreaCode?: string
        /**刷新token */
        refresh_token?: string
        /**租户ID：默认值 000000 */
        tenanId?: string
        /**登录传的类型，账户密码登录传account */
        type?: 'account'
        grant_type?: 'captcha' | 'password' | 'refresh_token' | 'privy_token'
        /**验证码 */
        captchaCode?: string
        scope?: 'all'
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RLoginResult, void>({
        path: `/oauth/token`,
        method: 'POST',
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  }
}
