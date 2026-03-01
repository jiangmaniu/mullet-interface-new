import type { CustomIndicator, PineJS } from 'public/static/charting_library'

import ma from '../custom-indicators/ma'

/** 指标工厂：接收 PineJS，返回 CustomIndicator */
export type IndicatorFactory = (PineJS: PineJS) => CustomIndicator

const indicators: IndicatorFactory[] = []

/**
 * 注册自定义指标
 * @param factory 指标工厂函数
 */
export function registerIndicator(factory: IndicatorFactory): void {
  if (!indicators.includes(factory)) {
    indicators.push(factory)
  }
}

/**
 * 获取所有已注册的指标
 */
export function getIndicators(): IndicatorFactory[] {
  return [...indicators]
}

/**
 * 根据 PineJS 实例生成指标数组，供 custom_indicators_getter 使用
 */
export function buildIndicators(PineJS: PineJS): CustomIndicator[] {
  return getIndicators().map((fn) => fn(PineJS))
}

// 默认注册内置指标（需在 registerIndicator 定义之后）
registerIndicator(ma)
