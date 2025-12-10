/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Authentication */
export interface Authentication {
  authenticated?: boolean;
  authorities?: GrantedAuthority[];
  credentials?: object;
  details?: object;
  name?: string;
  principal?: object;
}

/** Character */
export type Character = object;

/** Character_1 */
export type Character1 = object;

/** Character_2 */
export type Character2 = object;

/** GrantedAuthority */
export interface GrantedAuthority {
  authority?: string;
}

/** Locale */
export interface Locale {
  country?: string;
  displayCountry?: string;
  displayLanguage?: string;
  displayName?: string;
  displayScript?: string;
  displayVariant?: string;
  extensionKeys?: Character2[];
  iso3Country?: string;
  iso3Language?: string;
  language?: string;
  script?: string;
  unicodeLocaleAttributes?: string[];
  unicodeLocaleKeys?: string[];
  variant?: string;
}

/** Locale_1 */
export interface Locale1 {
  country?: string;
  displayCountry?: string;
  displayLanguage?: string;
  displayName?: string;
  displayScript?: string;
  displayVariant?: string;
  extensionKeys?: Character2[];
  iso3Country?: string;
  iso3Language?: string;
  language?: string;
  script?: string;
  unicodeLocaleAttributes?: string[];
  unicodeLocaleKeys?: string[];
  variant?: string;
}

/** Locale_2 */
export interface Locale2 {
  country?: string;
  displayCountry?: string;
  displayLanguage?: string;
  displayName?: string;
  displayScript?: string;
  displayVariant?: string;
  extensionKeys?: Character2[];
  iso3Country?: string;
  iso3Language?: string;
  language?: string;
  script?: string;
  unicodeLocaleAttributes?: string[];
  unicodeLocaleKeys?: string[];
  variant?: string;
}

/** ModelAndView */
export interface ModelAndView {
  empty?: boolean;
  model?: object;
  modelMap?: Record<string, object>;
  reference?: boolean;
  status?: ModelAndViewStatusEnum;
  view?: View;
  viewName?: string;
}

/** OAuth2AccessToken */
export interface OAuth2AccessToken {
  additionalInformation?: object;
  /** @format date-time */
  expiration?: string;
  expired?: boolean;
  /** @format int32 */
  expiresIn?: number;
  refreshToken?: OAuth2RefreshToken;
  scope?: string[];
  tokenType?: string;
  value?: string;
}

/** OAuth2RefreshToken */
export interface OAuth2RefreshToken {
  value?: string;
}

/** View */
export interface View {
  contentType?: string;
}

/**
 * R«Authentication»
 * 返回信息
 */
export interface RAuthentication {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Authentication;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

export type ModelAndViewStatusEnum =
  | "CONTINUE"
  | "SWITCHING_PROTOCOLS"
  | "PROCESSING"
  | "CHECKPOINT"
  | "OK"
  | "CREATED"
  | "ACCEPTED"
  | "NON_AUTHORITATIVE_INFORMATION"
  | "NO_CONTENT"
  | "RESET_CONTENT"
  | "PARTIAL_CONTENT"
  | "MULTI_STATUS"
  | "ALREADY_REPORTED"
  | "IM_USED"
  | "MULTIPLE_CHOICES"
  | "MOVED_PERMANENTLY"
  | "FOUND"
  | "MOVED_TEMPORARILY"
  | "SEE_OTHER"
  | "NOT_MODIFIED"
  | "USE_PROXY"
  | "TEMPORARY_REDIRECT"
  | "PERMANENT_REDIRECT"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "PAYMENT_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "NOT_ACCEPTABLE"
  | "PROXY_AUTHENTICATION_REQUIRED"
  | "REQUEST_TIMEOUT"
  | "CONFLICT"
  | "GONE"
  | "LENGTH_REQUIRED"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "REQUEST_ENTITY_TOO_LARGE"
  | "URI_TOO_LONG"
  | "REQUEST_URI_TOO_LONG"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "REQUESTED_RANGE_NOT_SATISFIABLE"
  | "EXPECTATION_FAILED"
  | "I_AM_A_TEAPOT"
  | "INSUFFICIENT_SPACE_ON_RESOURCE"
  | "METHOD_FAILURE"
  | "DESTINATION_LOCKED"
  | "UNPROCESSABLE_ENTITY"
  | "LOCKED"
  | "FAILED_DEPENDENCY"
  | "TOO_EARLY"
  | "UPGRADE_REQUIRED"
  | "PRECONDITION_REQUIRED"
  | "TOO_MANY_REQUESTS"
  | "REQUEST_HEADER_FIELDS_TOO_LARGE"
  | "UNAVAILABLE_FOR_LEGAL_REASONS"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_IMPLEMENTED"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE"
  | "GATEWAY_TIMEOUT"
  | "HTTP_VERSION_NOT_SUPPORTED"
  | "VARIANT_ALSO_NEGOTIATES"
  | "INSUFFICIENT_STORAGE"
  | "LOOP_DETECTED"
  | "BANDWIDTH_LIMIT_EXCEEDED"
  | "NOT_EXTENDED"
  | "NETWORK_AUTHENTICATION_REQUIRED";

export type GetLoginParamsStatusEnum =
  | "100 CONTINUE"
  | "101 SWITCHING_PROTOCOLS"
  | "102 PROCESSING"
  | "103 CHECKPOINT"
  | "200 OK"
  | "201 CREATED"
  | "202 ACCEPTED"
  | "203 NON_AUTHORITATIVE_INFORMATION"
  | "204 NO_CONTENT"
  | "205 RESET_CONTENT"
  | "206 PARTIAL_CONTENT"
  | "207 MULTI_STATUS"
  | "208 ALREADY_REPORTED"
  | "226 IM_USED"
  | "300 MULTIPLE_CHOICES"
  | "301 MOVED_PERMANENTLY"
  | "302 FOUND"
  | "302 MOVED_TEMPORARILY"
  | "303 SEE_OTHER"
  | "304 NOT_MODIFIED"
  | "305 USE_PROXY"
  | "307 TEMPORARY_REDIRECT"
  | "308 PERMANENT_REDIRECT"
  | "400 BAD_REQUEST"
  | "401 UNAUTHORIZED"
  | "402 PAYMENT_REQUIRED"
  | "403 FORBIDDEN"
  | "404 NOT_FOUND"
  | "405 METHOD_NOT_ALLOWED"
  | "406 NOT_ACCEPTABLE"
  | "407 PROXY_AUTHENTICATION_REQUIRED"
  | "408 REQUEST_TIMEOUT"
  | "409 CONFLICT"
  | "410 GONE"
  | "411 LENGTH_REQUIRED"
  | "412 PRECONDITION_FAILED"
  | "413 PAYLOAD_TOO_LARGE"
  | "413 REQUEST_ENTITY_TOO_LARGE"
  | "414 URI_TOO_LONG"
  | "414 REQUEST_URI_TOO_LONG"
  | "415 UNSUPPORTED_MEDIA_TYPE"
  | "416 REQUESTED_RANGE_NOT_SATISFIABLE"
  | "417 EXPECTATION_FAILED"
  | "418 I_AM_A_TEAPOT"
  | "419 INSUFFICIENT_SPACE_ON_RESOURCE"
  | "420 METHOD_FAILURE"
  | "421 DESTINATION_LOCKED"
  | "422 UNPROCESSABLE_ENTITY"
  | "423 LOCKED"
  | "424 FAILED_DEPENDENCY"
  | "425 TOO_EARLY"
  | "426 UPGRADE_REQUIRED"
  | "428 PRECONDITION_REQUIRED"
  | "429 TOO_MANY_REQUESTS"
  | "431 REQUEST_HEADER_FIELDS_TOO_LARGE"
  | "451 UNAVAILABLE_FOR_LEGAL_REASONS"
  | "500 INTERNAL_SERVER_ERROR"
  | "501 NOT_IMPLEMENTED"
  | "502 BAD_GATEWAY"
  | "503 SERVICE_UNAVAILABLE"
  | "504 GATEWAY_TIMEOUT"
  | "505 HTTP_VERSION_NOT_SUPPORTED"
  | "506 VARIANT_ALSO_NEGOTIATES"
  | "507 INSUFFICIENT_STORAGE"
  | "508 LOOP_DETECTED"
  | "509 BANDWIDTH_LIMIT_EXCEEDED"
  | "510 NOT_EXTENDED"
  | "511 NETWORK_AUTHENTICATION_REQUIRED";

export namespace Authorize {
  /**
   * No description
   * @tags authorization-endpoint
   * @name GetAuthorize
   * @summary authorize
   * @request GET:/oauth/authorize
   * @secure
   */
  export namespace GetAuthorize {
    export type RequestParams = {};
    export type RequestQuery = {
      complete?: boolean;
      name?: string;
      /** model */
      model?: object;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags authorization-endpoint
   * @name HeadAuthorize
   * @summary authorize
   * @request HEAD:/oauth/authorize
   * @secure
   */
  export namespace HeadAuthorize {
    export type RequestParams = {};
    export type RequestQuery = {
      complete?: boolean;
      name?: string;
      /** model */
      model?: object;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags authorization-endpoint
   * @name PostAuthorize
   * @summary approveOrDeny
   * @request POST:/oauth/authorize
   * @secure
   */
  export namespace PostAuthorize {
    export type RequestParams = {};
    export type RequestQuery = {
      complete?: boolean;
      name?: string;
      user_oauth_approval: string;
      /** approvalParameters */
      approvalParameters: Record<string, string>[];
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = View;
  }

  /**
   * No description
   * @tags authorization-endpoint
   * @name PutAuthorize
   * @summary authorize
   * @request PUT:/oauth/authorize
   * @secure
   */
  export namespace PutAuthorize {
    export type RequestParams = {};
    export type RequestQuery = {
      complete?: boolean;
      name?: string;
      /** model */
      model?: object;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags authorization-endpoint
   * @name DeleteAuthorize
   * @summary authorize
   * @request DELETE:/oauth/authorize
   * @secure
   */
  export namespace DeleteAuthorize {
    export type RequestParams = {};
    export type RequestQuery = {
      complete?: boolean;
      name?: string;
      /** model */
      model?: object;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags authorization-endpoint
   * @name OptionsAuthorize
   * @summary authorize
   * @request OPTIONS:/oauth/authorize
   * @secure
   */
  export namespace OptionsAuthorize {
    export type RequestParams = {};
    export type RequestQuery = {
      complete?: boolean;
      name?: string;
      /** model */
      model?: object;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags authorization-endpoint
   * @name PathAuthorize
   * @summary authorize
   * @request PATCH:/oauth/authorize
   * @secure
   */
  export namespace PathAuthorize {
    export type RequestParams = {};
    export type RequestQuery = {
      complete?: boolean;
      name?: string;
      /** model */
      model?: object;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }
}

export namespace Captcha {
  /**
   * @description 传入null
   * @tags 授权认证接口
   * @name GetCaptcha
   * @summary 验证码
   * @request GET:/oauth/captcha
   * @secure
   */
  export namespace GetCaptcha {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, object>;
  }
}

export namespace CheckToken {
  /**
   * No description
   * @tags check-token-endpoint
   * @name PostCheckToken
   * @summary checkToken
   * @request POST:/oauth/check_token
   * @secure
   */
  export namespace PostCheckToken {
    export type RequestParams = {};
    export type RequestQuery = {
      /** token */
      token: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Character;
  }
}

export namespace ClearCache {
  /**
   * @description 传入null
   * @tags 授权认证接口
   * @name GetClearCache
   * @summary 缓存清空
   * @request GET:/oauth/clear-cache
   * @secure
   */
  export namespace GetClearCache {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, object>;
  }
}

export namespace ConfirmAccess {
  /**
   * No description
   * @tags whitelabel-approval-endpoint
   * @name GetConfirmAccess
   * @summary getAccessConfirmation
   * @request GET:/oauth/confirm_access
   * @secure
   */
  export namespace GetConfirmAccess {
    export type RequestParams = {};
    export type RequestQuery = {
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-approval-endpoint
   * @name HeadConfirmAccess
   * @summary getAccessConfirmation
   * @request HEAD:/oauth/confirm_access
   * @secure
   */
  export namespace HeadConfirmAccess {
    export type RequestParams = {};
    export type RequestQuery = {
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-approval-endpoint
   * @name PostConfirmAccess
   * @summary getAccessConfirmation
   * @request POST:/oauth/confirm_access
   * @secure
   */
  export namespace PostConfirmAccess {
    export type RequestParams = {};
    export type RequestQuery = {
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-approval-endpoint
   * @name PutConfirmAccess
   * @summary getAccessConfirmation
   * @request PUT:/oauth/confirm_access
   * @secure
   */
  export namespace PutConfirmAccess {
    export type RequestParams = {};
    export type RequestQuery = {
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-approval-endpoint
   * @name DeleteConfirmAccess
   * @summary getAccessConfirmation
   * @request DELETE:/oauth/confirm_access
   * @secure
   */
  export namespace DeleteConfirmAccess {
    export type RequestParams = {};
    export type RequestQuery = {
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-approval-endpoint
   * @name OptionsConfirmAccess
   * @summary getAccessConfirmation
   * @request OPTIONS:/oauth/confirm_access
   * @secure
   */
  export namespace OptionsConfirmAccess {
    export type RequestParams = {};
    export type RequestQuery = {
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-approval-endpoint
   * @name PathConfirmAccess
   * @summary getAccessConfirmation
   * @request PATCH:/oauth/confirm_access
   * @secure
   */
  export namespace PathConfirmAccess {
    export type RequestParams = {};
    export type RequestQuery = {
      /** model */
      model?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }
}

export namespace Error {
  /**
   * No description
   * @tags whitelabel-error-endpoint
   * @name GetError
   * @summary handleError
   * @request GET:/oauth/error
   * @secure
   */
  export namespace GetError {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-error-endpoint
   * @name HeadError
   * @summary handleError
   * @request HEAD:/oauth/error
   * @secure
   */
  export namespace HeadError {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-error-endpoint
   * @name PostError
   * @summary handleError
   * @request POST:/oauth/error
   * @secure
   */
  export namespace PostError {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-error-endpoint
   * @name PutError
   * @summary handleError
   * @request PUT:/oauth/error
   * @secure
   */
  export namespace PutError {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-error-endpoint
   * @name DeleteError
   * @summary handleError
   * @request DELETE:/oauth/error
   * @secure
   */
  export namespace DeleteError {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-error-endpoint
   * @name OptionsError
   * @summary handleError
   * @request OPTIONS:/oauth/error
   * @secure
   */
  export namespace OptionsError {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }

  /**
   * No description
   * @tags whitelabel-error-endpoint
   * @name PathError
   * @summary handleError
   * @request PATCH:/oauth/error
   * @secure
   */
  export namespace PathError {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }
}

export namespace Login {
  /**
   * No description
   * @tags 授权认证接口
   * @name GetLogin
   * @summary require
   * @request GET:/oauth/login
   * @secure
   */
  export namespace GetLogin {
    export type RequestParams = {};
    export type RequestQuery = {
      model?: object;
      reference?: boolean;
      status?: GetLoginParamsStatusEnum;
      "view.contentType"?: string;
      viewName?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModelAndView;
  }
}

export namespace Logout {
  /**
   * @description 传入null
   * @tags 授权认证接口
   * @name GetLogout
   * @summary 退出登录
   * @request GET:/oauth/logout
   * @secure
   */
  export namespace GetLogout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, object>;
  }
}

export namespace Token {
  /**
   * No description
   * @tags token-endpoint
   * @name GetToken
   * @summary getAccessToken
   * @request GET:/oauth/token
   * @secure
   */
  export namespace GetToken {
    export type RequestParams = {};
    export type RequestQuery = {
      name?: string;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OAuth2AccessToken;
  }

  /**
   * No description
   * @tags token-endpoint
   * @name PostToken
   * @summary postAccessToken
   * @request POST:/oauth/token
   * @secure
   */
  export namespace PostToken {
    export type RequestParams = {};
    export type RequestQuery = {
      name?: string;
      /** parameters */
      parameters: Record<string, string>[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = OAuth2AccessToken;
  }
}

export namespace TokenKey {
  /**
   * No description
   * @tags token-key-endpoint
   * @name GetTokenKey
   * @summary getKey
   * @request GET:/oauth/token_key
   * @secure
   */
  export namespace GetTokenKey {
    export type RequestParams = {};
    export type RequestQuery = {
      name?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, string>;
  }
}

export namespace UserInfo {
  /**
   * @description 传入authentication
   * @tags 授权认证接口
   * @name GetUserInfo
   * @summary 用户信息
   * @request GET:/oauth/user-info
   * @secure
   */
  export namespace GetUserInfo {
    export type RequestParams = {};
    export type RequestQuery = {
      authenticated?: boolean;
      "authorities[0].authority"?: string;
      credentials?: object;
      details?: object;
      principal?: object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RAuthentication;
  }
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "//172.31.27.8:8000/blade-auth";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

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
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title BladeX 接口文档系统
 * @version 3.3.1.RELEASE
 * @license Powered By BladeX (https://bladex.cn)
 * @termsOfService https://bladex.cn
 * @baseUrl //172.31.27.8:8000/blade-auth
 * @contact 翼宿 <bladejava@qq.com> (https://gitee.com/smallc)
 *
 * BladeX 接口文档系统
 */
export class BladeAuthApi<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  authorize = {
    /**
     * No description
     *
     * @tags authorization-endpoint
     * @name GetAuthorize
     * @summary authorize
     * @request GET:/oauth/authorize
     * @secure
     */
    getAuthorize: (
      query: {
        complete?: boolean;
        name?: string;
        /** model */
        model?: object;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/authorize`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags authorization-endpoint
     * @name HeadAuthorize
     * @summary authorize
     * @request HEAD:/oauth/authorize
     * @secure
     */
    headAuthorize: (
      query: {
        complete?: boolean;
        name?: string;
        /** model */
        model?: object;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/authorize`,
        method: "HEAD",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags authorization-endpoint
     * @name PostAuthorize
     * @summary approveOrDeny
     * @request POST:/oauth/authorize
     * @secure
     */
    postAuthorize: (
      query: {
        complete?: boolean;
        name?: string;
        user_oauth_approval: string;
        /** approvalParameters */
        approvalParameters: Record<string, string>[];
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<View, void>({
        path: `/oauth/authorize`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags authorization-endpoint
     * @name PutAuthorize
     * @summary authorize
     * @request PUT:/oauth/authorize
     * @secure
     */
    putAuthorize: (
      query: {
        complete?: boolean;
        name?: string;
        /** model */
        model?: object;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/authorize`,
        method: "PUT",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags authorization-endpoint
     * @name DeleteAuthorize
     * @summary authorize
     * @request DELETE:/oauth/authorize
     * @secure
     */
    deleteAuthorize: (
      query: {
        complete?: boolean;
        name?: string;
        /** model */
        model?: object;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/authorize`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags authorization-endpoint
     * @name OptionsAuthorize
     * @summary authorize
     * @request OPTIONS:/oauth/authorize
     * @secure
     */
    optionsAuthorize: (
      query: {
        complete?: boolean;
        name?: string;
        /** model */
        model?: object;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/authorize`,
        method: "OPTIONS",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags authorization-endpoint
     * @name PathAuthorize
     * @summary authorize
     * @request PATCH:/oauth/authorize
     * @secure
     */
    pathAuthorize: (
      query: {
        complete?: boolean;
        name?: string;
        /** model */
        model?: object;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/authorize`,
        method: "PATCH",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  captcha = {
    /**
     * @description 传入null
     *
     * @tags 授权认证接口
     * @name GetCaptcha
     * @summary 验证码
     * @request GET:/oauth/captcha
     * @secure
     */
    getCaptcha: (params: RequestParams = {}) =>
      this.http.request<Record<string, object>, void>({
        path: `/oauth/captcha`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  checkToken = {
    /**
     * No description
     *
     * @tags check-token-endpoint
     * @name PostCheckToken
     * @summary checkToken
     * @request POST:/oauth/check_token
     * @secure
     */
    postCheckToken: (
      query: {
        /** token */
        token: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<Character, void>({
        path: `/oauth/check_token`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  clearCache = {
    /**
     * @description 传入null
     *
     * @tags 授权认证接口
     * @name GetClearCache
     * @summary 缓存清空
     * @request GET:/oauth/clear-cache
     * @secure
     */
    getClearCache: (params: RequestParams = {}) =>
      this.http.request<Record<string, object>, void>({
        path: `/oauth/clear-cache`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  confirmAccess = {
    /**
     * No description
     *
     * @tags whitelabel-approval-endpoint
     * @name GetConfirmAccess
     * @summary getAccessConfirmation
     * @request GET:/oauth/confirm_access
     * @secure
     */
    getConfirmAccess: (
      query?: {
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/confirm_access`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-approval-endpoint
     * @name HeadConfirmAccess
     * @summary getAccessConfirmation
     * @request HEAD:/oauth/confirm_access
     * @secure
     */
    headConfirmAccess: (
      query?: {
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/confirm_access`,
        method: "HEAD",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-approval-endpoint
     * @name PostConfirmAccess
     * @summary getAccessConfirmation
     * @request POST:/oauth/confirm_access
     * @secure
     */
    postConfirmAccess: (
      query?: {
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/confirm_access`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-approval-endpoint
     * @name PutConfirmAccess
     * @summary getAccessConfirmation
     * @request PUT:/oauth/confirm_access
     * @secure
     */
    putConfirmAccess: (
      query?: {
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/confirm_access`,
        method: "PUT",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-approval-endpoint
     * @name DeleteConfirmAccess
     * @summary getAccessConfirmation
     * @request DELETE:/oauth/confirm_access
     * @secure
     */
    deleteConfirmAccess: (
      query?: {
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/confirm_access`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-approval-endpoint
     * @name OptionsConfirmAccess
     * @summary getAccessConfirmation
     * @request OPTIONS:/oauth/confirm_access
     * @secure
     */
    optionsConfirmAccess: (
      query?: {
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/confirm_access`,
        method: "OPTIONS",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-approval-endpoint
     * @name PathConfirmAccess
     * @summary getAccessConfirmation
     * @request PATCH:/oauth/confirm_access
     * @secure
     */
    pathConfirmAccess: (
      query?: {
        /** model */
        model?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/confirm_access`,
        method: "PATCH",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  error = {
    /**
     * No description
     *
     * @tags whitelabel-error-endpoint
     * @name GetError
     * @summary handleError
     * @request GET:/oauth/error
     * @secure
     */
    getError: (params: RequestParams = {}) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/error`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-error-endpoint
     * @name HeadError
     * @summary handleError
     * @request HEAD:/oauth/error
     * @secure
     */
    headError: (params: RequestParams = {}) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/error`,
        method: "HEAD",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-error-endpoint
     * @name PostError
     * @summary handleError
     * @request POST:/oauth/error
     * @secure
     */
    postError: (params: RequestParams = {}) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/error`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-error-endpoint
     * @name PutError
     * @summary handleError
     * @request PUT:/oauth/error
     * @secure
     */
    putError: (params: RequestParams = {}) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/error`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-error-endpoint
     * @name DeleteError
     * @summary handleError
     * @request DELETE:/oauth/error
     * @secure
     */
    deleteError: (params: RequestParams = {}) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/error`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-error-endpoint
     * @name OptionsError
     * @summary handleError
     * @request OPTIONS:/oauth/error
     * @secure
     */
    optionsError: (params: RequestParams = {}) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/error`,
        method: "OPTIONS",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags whitelabel-error-endpoint
     * @name PathError
     * @summary handleError
     * @request PATCH:/oauth/error
     * @secure
     */
    pathError: (params: RequestParams = {}) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/error`,
        method: "PATCH",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  login = {
    /**
     * No description
     *
     * @tags 授权认证接口
     * @name GetLogin
     * @summary require
     * @request GET:/oauth/login
     * @secure
     */
    getLogin: (
      query?: {
        model?: object;
        reference?: boolean;
        status?: GetLoginParamsStatusEnum;
        "view.contentType"?: string;
        viewName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ModelAndView, void>({
        path: `/oauth/login`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  logout = {
    /**
     * @description 传入null
     *
     * @tags 授权认证接口
     * @name GetLogout
     * @summary 退出登录
     * @request GET:/oauth/logout
     * @secure
     */
    getLogout: (params: RequestParams = {}) =>
      this.http.request<Record<string, object>, void>({
        path: `/oauth/logout`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  token = {
    /**
     * No description
     *
     * @tags token-endpoint
     * @name GetToken
     * @summary getAccessToken
     * @request GET:/oauth/token
     * @secure
     */
    getToken: (
      query: {
        name?: string;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<OAuth2AccessToken, void>({
        path: `/oauth/token`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags token-endpoint
     * @name PostToken
     * @summary postAccessToken
     * @request POST:/oauth/token
     * @secure
     */
    postToken: (
      query: {
        name?: string;
        /** parameters */
        parameters: Record<string, string>[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<OAuth2AccessToken, void>({
        path: `/oauth/token`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  tokenKey = {
    /**
     * No description
     *
     * @tags token-key-endpoint
     * @name GetTokenKey
     * @summary getKey
     * @request GET:/oauth/token_key
     * @secure
     */
    getTokenKey: (
      query?: {
        name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<Record<string, string>, void>({
        path: `/oauth/token_key`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  userInfo = {
    /**
     * @description 传入authentication
     *
     * @tags 授权认证接口
     * @name GetUserInfo
     * @summary 用户信息
     * @request GET:/oauth/user-info
     * @secure
     */
    getUserInfo: (
      query?: {
        authenticated?: boolean;
        "authorities[0].authority"?: string;
        credentials?: object;
        details?: object;
        principal?: object;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RAuthentication, void>({
        path: `/oauth/user-info`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
}
