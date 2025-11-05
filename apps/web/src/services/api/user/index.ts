import { stringify } from 'qs'

import { request } from '@/utils/request'
import { setLocalUserInfo, STORAGE_GET_USER_INFO } from '@/utils/storage'

// 获取图形验证码
export async function getCaptcha() {
  return request<User.Captcha>('/api/blade-auth/oauth/captcha', {
    method: 'GET',
    needToken: false,
    authorization: false
  })
}

// 登录接口
export async function login(body: User.LoginParams, options?: { [key: string]: any }) {
  return request<User.LoginResult>(`/api/blade-auth/oauth/token?${stringify(body)}`, {
    method: 'POST',
    needToken: false,
    ...(options || {})
  })
}

// 刷新token
export async function refreshToken() {
  const userInfo = STORAGE_GET_USER_INFO() as User.UserInfo
  const body = {
    grant_type: 'refresh_token',
    scope: 'all',
    refresh_token: userInfo?.refresh_token
  }
  return request<User.UserInfo>(`/api/blade-auth/oauth/token?${stringify(body)}`, {
    method: 'POST'
  }).then((res) => {
    if (res?.access_token) {
      setLocalUserInfo(res)
    }
    return res
  })
}

// 退出登录
export async function logout() {
  return request('/api/blade-auth/oauth/logout', {
    method: 'GET',
    authorization: false
  })
}

// 发送邮箱验证码(输入邮箱)
export async function sendCustomEmailCode(body: { email?: string }) {
  return request<API.Response<any>>(`/api/trade-crm/crmClient/validateCode/customEmail?${stringify(body)}`, {
    method: 'POST',
    needToken: false,
    replayProtection: true,
    data: body
  })
}

// 发送邮箱验证码（不需要输入邮箱）
export async function sendEmailCode() {
  return request<API.Response<any>>('/api/trade-crm/crmClient/validateCode/userEmail', {
    method: 'POST'
  })
}

// 发送手机验证码(输入手机)
export async function sendCustomPhoneCode(body: { phone?: string; phoneAreaCode?: string }) {
  return request<API.Response<any>>(`/api/trade-crm/crmClient/validateCode/customPhone?${stringify(body)}`, {
    method: 'POST',
    needToken: false,
    replayProtection: true,
    data: body
  })
}

// 发送手机验证码(不需要输入手机)
export async function sendPhoneCode() {
  return request<API.Response<any>>('/api/trade-crm/crmClient/validateCode/userPhone', {
    method: 'POST'
  })
}

// 客户用户-手机注册
export async function registerSubmitPhone(body: User.RegisterParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/register/submitPhone', {
    method: 'POST',
    needToken: false,
    data: body,
    replayProtection: true
  })
}

// 客户用户-邮箱注册
export async function registerSubmitEmail(body: User.RegisterParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/register/submitEmail', {
    method: 'POST',
    needToken: false,
    data: body
  })
}

// 客户用户-忘记密码【手机】
export async function forgetPasswordPhone(body: User.ForgetPasswordParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/register/forgetPasswordPhone', {
    method: 'POST',
    needToken: false,
    data: body
  })
}

// 客户用户-忘记密码【邮箱】
export async function forgetPasswordEmail(body: User.ForgetPasswordParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/register/forgetPasswordEmail', {
    method: 'POST',
    needToken: false,
    data: body
  })
}

// 更换手机号
export async function editPhone(body: User.EditPhoneParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/user/editPhone', {
    method: 'POST',
    data: body
  })
}

// 更换邮箱
export async function editEmail(body: User.EditEmailParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/user/editEmail', {
    method: 'POST',
    data: body
  })
}

// 绑定手机
export async function bindPhone(body: User.BindPhoneParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/user/bindPhone', {
    method: 'POST',
    data: body
  })
}

// 绑定邮箱
export async function bindEmail(body: User.BindEmailParams) {
  return request<API.Response<any>>('/api/trade-crm/crmClient/user/bindEmail', {
    method: 'POST',
    data: body
  })
}

// 用户-设置语言
export async function setUserLanguage(body: { language: any }) {
  return request<API.Response<any>>(`/api/trade-crm/crmApi/user/setLanguage?language=${body?.language || ''}`, {
    method: 'POST',
    data: body,
    needToken: true
  })
}
