# 枚举 Option 范式

## 概述
项目中使用运行时 enum + lingui msg 定义枚举选项，替代 `declare namespace API` 中的 ambient enum（ambient enum 在 Hermes 运行时不存在）。

## 定义位置
`src/options/trade/order.tsx`

## 范式结构

### 1. 通用工具函数
```tsx
import { MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"

type EnumOption<T> = { label: MessageDescriptor; value: T }

/** 基于传入的 option key 的值获取匹配的 option 数据 */
export function getEnumOption<T>(options: EnumOption<T>[], option: Partial<EnumOption<T>>) {
  return options.find((item) => {
    const optionKeys = Object.keys(option) as (keyof EnumOption<T>)[]
    return optionKeys.every((key) => item[key] === option[key])
  })
}
```

### 2. 定义枚举 + Options + getter
```tsx
export enum OrderTypeEnum {
  MARKET_ORDER = 'MARKET_ORDER',
  LIMIT_BUY_ORDER = 'LIMIT_BUY_ORDER',
  // ...
}

export const ORDER_TYPE_ENUM_OPTIONS: EnumOption<OrderTypeEnum>[] = [
  { label: msg`市价单`, value: OrderTypeEnum.MARKET_ORDER },
  { label: msg`限价买入单`, value: OrderTypeEnum.LIMIT_BUY_ORDER },
  // ...
]

export const getOrderTypeEnumOption = (option: Partial<EnumOption<OrderTypeEnum>>) => {
  return getEnumOption(ORDER_TYPE_ENUM_OPTIONS, option)
}
```

### 3. 在组件中使用（配合 lingui 渲染）
```tsx
import { getOrderTypeEnumOption } from '@/options/trade/order'
import { useI18n } from '@/hooks/use-i18n'

const { renderLinguiMsg } = useI18n()

// 渲染
{renderLinguiMsg(getOrderTypeEnumOption({ value: order.type })?.label, <Trans>未知类型</Trans>)}
```

## 注意事项
- `msg` 标记的字符串会被 lingui 提取和翻译
- `renderLinguiMsg` 第二个参数为 fallback，当 option 未匹配时显示
- 不要使用 `declare namespace` 中的 enum 作为运行时值（Hermes 不支持）
- typings.d.ts 中的类型引用应使用 `import type { OrderTypeEnum }` 并替换 `API.OrderType`
