import { XMLBuilder, XMLParser } from 'fast-xml-parser'

import { getEnv } from '@/v1/env'

// SOAP 请求配置
const DEFAULT_TIMEOUT = 10000

// 带超时的 fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request Timeout')
    }
    throw error
  }
}

// export const cbcLogin = async () => {
//   const ENVS = await getEnv()

//   const res = await callSoapService(
//     'VipLogin',
//     {
//       xmlns: 'CBCWEB',
//       id: 'o0',
//       'c:root': '1',
//       loginname: {
//         'i:type': 'd:string',
//         '#text': ENVS.CBC_LOGIN_NAME
//       },
//       loginpass: {
//         'i:type': 'd:string',
//         '#text': ENVS.CBC_LOGIN_PASS
//       },
//       pass: {
//         'i:type': 'd:string',
//         '#text': ENVS.CBC_PASS
//       }
//     },
//     {
//       headers: {
//         'Content-Type': 'text/xml;charset=UTF-8'
//       },
//       url: ENVS.CBC_LOGIN_URL
//     }
//   )

// // console.log('cbcLogin res', res)
// }

// 用于构建 SOAP 请求体
export async function callSoapService(api: string, body: object, options?: { headers?: object; url?: string }) {
  const ENVS = await getEnv()
  const url = options?.url || '/admob/andr.asmx'
  const fullUrl = `${ENVS.CBC_SERVER}${url}`

  // 构建 headers，确保所有值都是字符串
  const headers: Record<string, string> = {
    'Content-Type': 'application/soap+xml; charset=utf-8',
    Accept: '*/*',
    SOAPAction: 'CBCWEB/SelectChart_paraminfo',
  }

  // 合并自定义 headers
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        headers[key] = String(value)
      }
    })
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false, // 保留属性（例如 i:type）
    attributeNamePrefix: '', // 不加前缀
    format: true, // 是否格式化输出
    suppressEmptyNode: false, // 保留空节点
  })

  const obj = {
    'v:Envelope': {
      'xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:d': 'http://www.w3.org/2001/XMLSchema',
      'xmlns:c': 'http://www.w3.org/2003/05/soap-encoding',
      'xmlns:v': 'http://www.w3.org/2003/05/soap-envelope',
      'v:Header': {},
      'v:Body': {
        [api]: body,
      },
    },
  }

  const xml = builder.build(obj)

  try {
    // console.log('🚀 SOAP Request:', fullUrl)
    // console.log('🚀 SOAP Headers:', headers)

    const response = await fetchWithTimeout(
      fullUrl,
      {
        method: 'POST',
        headers,
        body: xml,
      },
      DEFAULT_TIMEOUT,
    )

    if (!response.ok) {
      console.error('❌ Response Error:', response.status, response.statusText)
      throw new Error(`HTTP Error: ${response.status}`)
    }

    // console.log('🚀 Response: Success')
    const data = await response.text()

    const json = extractJsonFromSoapResponse(data)
    const result = json?.[`${api}Response`]?.[`${api}Result`]

    return result
  } catch (error) {
    console.error('❌ SOAP 调用失败', error)
    throw error
  }
}

export function extractJsonFromSoapResponse(xmlString: string): any {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '', // 不使用 @_
    removeNSPrefix: true, // 移除前缀如 soap:
  })
  const json = parser.parse(xmlString)

  // Try to find the result in either paraminfo or chartlist response
  const result = json['Envelope']?.['Body']

  return result
}

// 用于构建 SOAP 请求体中的 i:type 和 #text， 简化页面代码
export const itype = (val: any) => ({ 'i:type': 'd:string', '#text': String(val) })
