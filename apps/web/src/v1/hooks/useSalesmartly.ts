import { getEnv } from '@/env'
import { isPCByWidth } from '@/utils'
import { useIntl, useModel } from '@umijs/max'
import { useEffect } from 'react'

// 客服配置
export default function useSalesmartly() {
  const { initialState } = useModel('@@initialState')
  const { currentUser } = initialState || {}
  const intl = useIntl()
  const ENV = getEnv()
  const locale = intl.locale
  let lng = ''

  if (locale === 'zh-TW') {
    lng = 'zh-CN'
  } else if (locale === 'en-US') {
    lng = 'en-US'
  } else if (locale === 'vi-VN') {
    lng = 'vi-VN'
  }

  useEffect(() => {
    if (!currentUser?.user_id) return

    // 设置用户信息
    window.ssq?.push?.('setLoginInfo', {
      user_id: currentUser?.user_id, // 加密后的用户id, 必填！
      user_name: currentUser?.userInfo?.realName || currentUser?.userInfo?.name, // 对应用户名，可在客户资料查看
      language: lng, // 对应用户语言，可在客户资料查看
      phone: `${currentUser?.userInfo?.phoneAreaCode} ${currentUser?.userInfo?.phone}`, // 对应用户手机号，可在客户资料查看
      email: currentUser?.userInfo?.email, // 对应用户邮箱，可在客户资料查看
      description: currentUser?.countryInfo?.nameCn, // 对应用户的描述信息，例如套餐信息，可在客户资料查看
      label_names: [currentUser.address, currentUser?.userInfo?.lastLoginIp, currentUser?.userInfo?.lastLoginTime] // 对应用户标签，仅支持传系统已创建的标签值，可在客户资料查看
    })
  }, [currentUser, lng])

  const initScript = () => {
    // salesmartly客服配置
    if (!ENV?.salesmartlyJSUrl) return
    setTimeout(() => {
      if (!isPCByWidth()) {
        hideCloseIcon()
      }
      hideUpload()
    }, 100)
  }

  useEffect(() => {
    initScript()
  }, [])

  // 打开聊天窗口
  const chatOpen = () => {
    window.ssq?.push?.('chatOpen')
  }

  // 关闭聊天窗口
  const chatClose = () => {
    window.ssq?.push?.('chatClose')
  }

  // 隐藏关闭右上角窗口按钮
  const hideCloseIcon = () => {
    window.ssq?.push?.('hideCloseIcon')
  }

  // 关闭上传功能
  const hideUpload = () => {
    // 'img' 图片类型
    // 'video' 视频类型
    // 'document' 附件类型
    window.ssq?.push?.('hideUpload', ['document'])
  }

  return {
    chatOpen,
    chatClose,
    hideCloseIcon,
    hideUpload
  }
}
