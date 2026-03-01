import { createContext, useCallback, useContext, useState } from 'react'
import { useEffect } from 'react'

import { Environment } from '@/constants/enum'
import stores from '@/stores'

type SizeInfo = {
  width: number
  height: number
}

type ProviderType = {
  deviceType?: Environment
  screenSize?: SizeInfo
  isMobile?: boolean
  isIpad?: boolean
  isPc?: boolean
}

interface IProps {
  children: React.ReactNode
}

const Context = createContext<ProviderType>({})

export const ConfigProvider = ({ children }: IProps) => {
  const [screenSize, setScreenSize] = useState<SizeInfo>()
  const [deviceType, setDeviceType] = useState<Environment>(Environment.none) // 服务器渲染初始化渲染未必是预期效果，none缓冲切换视觉)

  const onResize = useCallback(() => {
    const size: SizeInfo = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    }
    const width = size.width
    setScreenSize(size)

    // 用宽度去判断，是为了适配不改机型，仅拉扯屏幕宽度的情况
    if (width < 768) {
      // 手机端
      setDeviceType(Environment.mobile)
    } else if (width >= 768 && width < 1200) {
      // ipad端
      setDeviceType(Environment.ipad)
    } else if (width >= 1200) {
      // pc端
      setDeviceType(Environment.pc)
    } else {
      // 增加none类型来缓冲默认类型样式切换时的视觉突变
      setDeviceType(Environment.none)
    }
  }, [])

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  const exposed = {
    deviceType,
    screenSize,
    isMobile: deviceType === 'mobile',
    isIpad: deviceType === 'mobile',
    isPc: deviceType === 'pc'
  }

  return <Context.Provider value={exposed}>{children}</Context.Provider>
}

export const useConfig = () => useContext(Context)
