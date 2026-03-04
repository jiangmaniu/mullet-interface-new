import { EXPO_ENV_CONFIG } from '@/constants/expo';
import { getAccessToken } from '@privy-io/expo';
import { toast } from '@/components/ui/toast';
import { i18n } from '@lingui/core';

interface DepositRequestConfig {
	/** 请求方法 */
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	/** URL参数 */
	params?: Record<string, any>;
	/** 请求体数据 */
	data?: any;
	/** 自定义 headers */
	headers?: Record<string, string>;
	/** 是否跳过错误提示 */
	skipErrorHandler?: boolean;
	/** 请求超时时间(ms) */
	timeout?: number;
	/** 是否需要 Privy Authorization（默认 true） */
	needPrivyAuth?: boolean;
}

interface DepositResponse<T = any> {
	success: boolean;
	data: T;
	msg?: string;
	code?: number;
}

// 默认超时时间
const DEFAULT_TIMEOUT = 30000;

/**
 * 构建 URL 参数
 */
function buildUrlWithParams(baseUrl: string, params?: Record<string, any>): string {
	if (!params) return baseUrl;

	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			searchParams.append(key, String(value));
		}
	});

	const queryString = searchParams.toString();
	if (!queryString) return baseUrl;

	return baseUrl.includes('?') ? `${baseUrl}&${queryString}` : `${baseUrl}?${queryString}`;
}

/**
 * 带超时的 fetch
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error: any) {
		clearTimeout(timeoutId);
		if (error?.name === 'AbortError') {
			throw new Error('Request Timeout');
		}
		throw error;
	}
}

/**
 * 出入金专用请求函数
 * 使用原生 fetch 实现，独立于旧的 request 工具
 *
 * 自动处理：
 * 1. baseURL 设置为 DEPOSIT_API_BASE_URL
 * 2. Authorization header 设置为 Bearer <Privy Access Token>
 * 3. 错误处理和 toast 提示
 * 4. 超时控制
 */
export async function depositRequest<T = any>(url: string, config?: DepositRequestConfig): Promise<T> {
	const needPrivyAuth = config?.needPrivyAuth !== false; // 默认需要认证
	const skipErrorHandler = config?.skipErrorHandler ?? false;
	const timeout = config?.timeout ?? DEFAULT_TIMEOUT;

	try {
		// 获取 Privy Access Token
		let privyToken: string | null = null;
		if (needPrivyAuth) {
			try {
				privyToken = await getAccessToken();
				if (!privyToken) {
					throw new Error('Privy token not available');
				}
			} catch (error) {
				console.error('Failed to get Privy access token:', error);
				throw new Error('Authentication failed');
			}
		}

		// 构建完整 URL
		const baseURL = EXPO_ENV_CONFIG.DEPOSIT_API_BASE_URL;
		const cleanBaseURL = baseURL.replace(/\/$/, '');
		const cleanUrl = url.startsWith('/') ? url : `/${url}`;
		const fullUrl = buildUrlWithParams(`${cleanBaseURL}${cleanUrl}`, config?.params);

		// 构建 headers
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(config?.headers || {}),
		};

		// 添加语言
		if (i18n.locale) {
			headers['Language'] = i18n.locale;
		}

		// 添加 Privy Authorization
		if (needPrivyAuth && privyToken) {
			headers['Authorization'] = `Bearer ${privyToken}`;
		}

		// 构建请求配置
		const method = config?.method?.toUpperCase() || 'GET';
		const fetchOptions: RequestInit = {
			method,
			headers,
		};

		// 添加请求体（仅对非 GET 请求）
		if (config?.data && method !== 'GET') {
			fetchOptions.body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
		}

		console.log('🔄 Deposit API Request:', fullUrl, method);

		// 执行请求
		const response = await fetchWithTimeout(fullUrl, fetchOptions, timeout);

		// 解析响应
		const text = await response.text();
		let data: DepositResponse<T>;
		try {
			data = JSON.parse(text);
		} catch {
			throw new Error('Invalid JSON response');
		}

		console.log('✅ Deposit API Response:', response.status, data);

		// 处理 HTTP 错误状态码
		if (!response.ok) {
			const errorMessage = data?.msg || `HTTP Error ${response.status}`;
			if (!skipErrorHandler) {
				toast.error(errorMessage);
			}
			throw new Error(errorMessage);
		}

		// 处理业务错误码
		if (data.success === false || (data.code && data.code !== 200)) {
			const errorMessage = data.msg || 'Request failed';
			if (!skipErrorHandler) {
				toast.error(errorMessage);
			}
			throw new Error(errorMessage);
		}

		// 返回数据
		return data as T;
	} catch (error: any) {
		console.error('❌ Deposit API Error:', error.message);

		// 处理特定错误
		if (error.message === 'Request Timeout') {
			!skipErrorHandler && toast.error('Request Timeout');
		} else if (error.message?.includes('Network request failed')) {
			!skipErrorHandler && toast.error('Network error, please retry');
		} else if (!skipErrorHandler && error.message !== 'Authentication failed') {
			// Authentication failed 已经在上面处理过了，不重复提示
			toast.error(error.message);
		}

		throw error;
	}
}
