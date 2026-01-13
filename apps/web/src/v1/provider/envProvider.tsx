import { createContext, JSX, useCallback, useContext, useEffect, useState } from 'react'

import { useDeviceChange } from '@/v1/hooks/useDeviceChange'

type SizeInfo = {
  width: number
  height: number
}
type ProviderType = {
  /**是否是pwa应用 */
  isPwaApp: boolean
  /**是否在react-native webview中打开 */
  isRNWebview: boolean
  /** 屏幕宽高信息 */
  screenSize: SizeInfo
  /**手机模式，不包含ipad */
  isMobile: boolean
  /**@name isIpad 是否是ipad端，width >= 768 && width < 1200 即md、lg*/
  isIpad: boolean
  /**@name isMobileOrIpad 小于1200px处断点：移动端断点，即包含ipad和手机端,ipda最大是1199，大于1199则是pc端 */
  isMobileOrIpad: boolean
  /**@name isPc 是否是pc端，大于1200px断点则是pc端 */
  isPc: boolean
  /**
  @name xs: {
    maxWidth: 575,
    matchMedia: '(max-width: 575px)',
  },
  @name sm: {
    minWidth: 576,
    maxWidth: 767,
    matchMedia: '(min-width: 576px) and (max-width: 767px)',
  },
  @name md: {
    minWidth: 768,
    maxWidth: 991,
    matchMedia: '(min-width: 768px) and (max-width: 991px)',
  },
  @name lg: {
    minWidth: 992,
    maxWidth: 1199,
    matchMedia: '(min-width: 992px) and (max-width: 1199px)',
  },
  @name xl: {
    minWidth: 1200,
    maxWidth: 1599,
    matchMedia: '(min-width: 1200px) and (max-width: 1599px)',
  },
  @name xxl: {
    minWidth: 1600,
    matchMedia: '(min-width: 1600px)',
  },
  */
  breakPoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
}

interface IProps {
  children: React.ReactNode
}

const Context = createContext<ProviderType>({} as ProviderType)

export const EnvProvider = ({ children }: IProps) => {
  const [screenSize, setScreenSize] = useState({} as SizeInfo)

  // // 根据不同分辨率缩放屏幕大小
  // function adjustScale(size: SizeInfo) {
  //   const width = size?.width
  //   let scale = 1

  //   if (width >= 1540) {
  //     scale = 1 // 100%
  //   } else if (width < 1540 && width >= 1470) {
  //     scale = 0.9 // 94%
  //   } else if (width < 1470 && width >= 1200) {
  //     scale = 0.85 // 85%
  //   }
  //   // @ts-ignore
  //   document.body.style.zoom = scale
  // }

  // const onResize = useCallback(
  //   debounce(() => {
  //     const size: SizeInfo = {
  //       width: document.documentElement.clientWidth,
  //       height: document.documentElement.clientHeight
  //     }
  //     setScreenSize(size)
  //     adjustScale(size)
  //   }, 100),
  //   []
  // ) // 100ms 的防抖时间

  // useEffect(() => {
  //   onResize()
  //   window.addEventListener('resize', onResize)
  //   return () => {
  //     window.removeEventListener('resize', onResize)
  //   }
  // }, [onResize])

  /** 检查设备类型，如果设备类型发生变化，则跳转到对应的页面 */
  const { exposed } = useDeviceChange()

  return (
    <Context.Provider
      value={
        {
          ...exposed,
          screenSize,
        } as ProviderType
      }
    >
      {children}
    </Context.Provider>
  )
}

export const useEnv = () => useContext(Context)
