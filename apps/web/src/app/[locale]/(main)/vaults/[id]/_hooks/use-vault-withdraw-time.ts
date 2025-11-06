import { useMemo, useState } from 'react'
import { useCountDown } from 'ahooks'

import { dayjs } from '@mullet/utils/dayjs'

interface UseVaultWithdrawTimeParams {
  lastVisitedTime?: string | null
  /** 间隔时间，默认为1天 */
  intervalDays?: number
}

interface UseVaultWithdrawTimeReturn {
  canWithdraw: boolean
  remainingTime: string
  canWithdrawTime: string
}

export function useVaultWithdrawTime({
  lastVisitedTime,
  intervalDays = 1,
}: UseVaultWithdrawTimeParams): UseVaultWithdrawTimeReturn {
  const [canWithdrawTime, setCanWithdrawTime] = useState<string>('')

  // 计算目标时间戳
  const targetTime = useMemo(() => {
    if (!lastVisitedTime) return 0

    const lastVisitedDayjs = dayjs(lastVisitedTime)
    const canWithdrawTimeDayjs = lastVisitedDayjs.add(intervalDays, 'day')

    // 设置可提取时间的格式化字符串
    setCanWithdrawTime(canWithdrawTimeDayjs.format('YYYY/M/D HH:mm:ss'))

    return canWithdrawTimeDayjs.valueOf()
  }, [lastVisitedTime, intervalDays])

  const [countdown, formattedRes] = useCountDown({
    targetDate: targetTime,
  })

  // 计算是否可以提取
  const canWithdraw = useMemo(() => {
    if (!lastVisitedTime) return true
    return countdown === 0
  }, [countdown, lastVisitedTime])

  // 格式化剩余时间
  const remainingTime = useMemo(() => {
    if (canWithdraw || countdown === 0) return ''

    const { hours, minutes, seconds } = formattedRes
    return `${hours}小时${minutes}分钟${seconds}秒`
  }, [canWithdraw, countdown, formattedRes])

  return {
    canWithdraw,
    remainingTime,
    canWithdrawTime,
  }
}
