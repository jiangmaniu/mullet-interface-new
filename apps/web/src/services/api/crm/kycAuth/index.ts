import qs from 'qs'

import { request } from '@/utils/request'

// KYC 基礎認證
export async function submitBaseAuth(body: KycAuth.SubmitBaseAuthParams) {
  return request<API.Response>('/api/trade-crm/crmClient/user/baseAuth', {
    method: 'POST',
    data: body
  })
}

// KYC 高級認證
export async function submitSeniorAuth(body: { authImgsUrl: string }) {
  return request<API.Response>(`/api/trade-crm/crmClient/user/seniorAuth?authImgsUrl=${body.authImgsUrl}`, {
    method: 'POST',
    data: body
  })
}

// 人臉核身
export async function submitFaceAuth(body: { idCard: string; name: string; redirectUrl: string }) {
  return request<API.Response>(`/api/trade-crm/crmClient/face/getFaceAuthUrl`, {
    method: 'POST',
    data: body
  })
}

// 人臉核身-认证成功
export async function submitFaceAuthSuccess(body: { bizToken: string }) {
  return request<API.Response>(`/api/trade-crm/crmClient/face/updateFaceResult`, {
    method: 'POST',
    data: body,
    noMessage: true
  })
}

// KYC身份认证-提交审核
export async function submitKycAuth(body: KycAuth.SubmitKycAuthParams) {
  return request<API.Response>('/api/trade-crm/crmClient/user/kycAuth', {
    method: 'POST',
    data: body
  })
}

// KYC身份认证-分页
export async function getKycAuthList(params?: API.PageParam & { clientId: any }) {
  return request<API.Response<API.PageResult<KycAuth.ListItem>>>('/api/trade-crm/crmApi/kycAuth/list', {
    method: 'GET',
    params
  })
}

// KYC身份认证-详情
export async function getKycAuthDetail(params: API.IdParam) {
  return request<API.Response<KycAuth.ListItem>>('/api/trade-crm/crmApi/kycAuth/detail', {
    method: 'GET',
    params
  })
}

// 经理用户-删除
export async function removeKycAuth(body: API.IdParam) {
  return request<API.Response>(`/api/trade-crm/crmApi/kycAuth/remove?${qs.stringify(body)}`, {
    method: 'POST'
  })
}
