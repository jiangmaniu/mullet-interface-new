import { FormattedMessage, useModel } from '@umijs/max'
import { useMemo } from 'react'

type StatusItem = {
  label: any
  desc: any
  operation: any
  color: any
}

type RetProps = StatusItem & {
  status: number
  phone?: string
  email?: string
  /**kyc授权方式 控制页面展示 */
  kycAuthType?: API.KycAuthType
  /**kyc认证流程全部通过 */
  isKycAuth?: boolean
  /**是否完成基础kyc认证 填写姓名身份证号码 */
  isBaseAuth?: boolean
  /**不需要授权 */
  notKycAuth?: boolean
}

// 自定义状态
export const getKycStatus = (kycStatus: API.ApproveStatus, isBaseAuth: boolean, isKycAuth: boolean) => {
  // if (!phone) {
  //   return -1 // 未绑定手机号
  // }
  if (isBaseAuth && isKycAuth) {
    return 4 // 审核通过
  } else if (isBaseAuth && !isKycAuth && kycStatus !== 'TODO' && kycStatus !== 'CANCEL' && kycStatus !== 'DISALLOW') {
    return 1 // 初级审核通过，待申请高级认证
  } else if (isBaseAuth && kycStatus === 'TODO') {
    return 2 // 初级审核通过，高级认证待审批
  } else if (isBaseAuth && kycStatus === 'DISALLOW') {
    return 3 // 初级审核已通过，高级认证不通过
  } else {
    return 0 // 初始
  }
}

// kyc状态信息
export default function useKycAuth() {
  const { initialState } = useModel('@@initialState')

  const currentUser = initialState?.currentUser
  const kycAuthInfo = currentUser?.kycAuth?.[0]
  const kycStatus = kycAuthInfo?.status as API.ApproveStatus
  const isBaseAuth = currentUser?.isBaseAuth || false
  const isKycAuth = currentUser?.isKycAuth || false // true kyc全部流程通过
  const phone = currentUser?.userInfo?.phone || ''
  const email = currentUser?.userInfo?.email || ''

  const kycAuthType = currentUser?.clientGroup?.kycAuth // 授权方式

  const status = useMemo(() => {
    return getKycStatus(kycStatus, isBaseAuth, isKycAuth)
  }, [kycStatus, isBaseAuth, isKycAuth])

  const statusLabels = [
    {
      label: <FormattedMessage id="mt.weiwanchengchujirenzheng" />,
      desc: <FormattedMessage id="mt.qingwanchengchujirenzheng" />,
      operation: <FormattedMessage id="mt.quchujirenzheng" />,
      color: 'text-red'
    },
    {
      label: <FormattedMessage id="mt.yiwanchengchujirenzheng" />,
      desc: <FormattedMessage id="mt.weifangbianchujin" />,
      operation: <FormattedMessage id="mt.qugaojirenzheng" />,
      color: 'text-green'
    },
    {
      label: <FormattedMessage id="mt.shenhezhong" />,
      desc: <FormattedMessage id="mt.qingnaixindenghoushenhe" />,
      operation: <FormattedMessage id="mt.chakanjindu" />,
      color: 'text-yellow-500'
    },
    {
      label: <FormattedMessage id="mt.gaojirenzhengbeijujue" />,
      desc: <FormattedMessage id="mt.qingzixianzhaoshuomingchongshi" />,
      operation: <FormattedMessage id="mt.zaishiyici" />,
      color: 'text-red'
    },
    {
      label: <FormattedMessage id="mt.yiwanchenggaojirenzheng" />,
      desc: <FormattedMessage id="mt.ninyiwanchengsuoyourenzheng" />,
      operation: <FormattedMessage id="mt.chakanxinxi" />,
      color: 'text-green'
    }
  ]

  return {
    ...statusLabels[status],
    status,
    phone,
    email,
    kycAuthType,
    isKycAuth,
    isBaseAuth,
    // 不需要授权
    notKycAuth: kycAuthType && kycAuthType === 'NOT'
  } as RetProps
}
