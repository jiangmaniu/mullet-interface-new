import { MessageDescriptor } from "@lingui/core"

export type EnumOption<T> = { label: MessageDescriptor; value: T }

/** 基于传入的 option key 的值获取匹配的 option 数据 */
export function getEnumOption<T>(options: EnumOption<T>[], option: Partial<EnumOption<T>>) {
  return options.find((item) => {
    const optionKeys = Object.keys(option) as (keyof EnumOption<T>)[]
    return optionKeys.every((key) => item[key] === option[key])
  })
}
