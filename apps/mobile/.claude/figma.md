# Figma 图标规范

Figma 中有三种类型的图标组件，根据类型不同需要在不同位置创建：

## 1. iconoir-icon（Figma 组件类型）

**识别方式**：Figma 中组件名为 `iconoir-icon`，变体属性为 `iconoir=iconoir:xxx`

**处理方式**：
- 在 `src/components/ui/icons/iconify.tsx` 中导入并导出
- 从 `iconoir-react-native` 导入对应图标
- 使用 `withUniwind` 包装后导出

**示例**：
```tsx
import { WarningCircle } from 'iconoir-react-native'
export const IconifyWarningCircle = withUniwind(WarningCircle)
```

## 2. special-icon（Figma 组件类型）

**识别方式**：Figma 中组件名为 `special-icon`，变体属性为 `special=xxx`

**处理方式**：
- 在 `src/components/ui/icons/set/` 目录下创建 SVG 组件
- 文件名使用 `special` 变体属性值（kebab-case）
- 使用 `react-native-svg` 和 `SvgIcon` 包装器

**示例**（`set/depth.tsx`）：
```tsx
import { Rect } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../svg-icon"

export const IconDepth = ({ primaryColor, ...props }: SvgIconProps & { primaryColor?: string }) => (
  <SvgIcon width='12' height='12' viewBox='0 0 12 12' fill="none" {...props}>
    <Rect ... />
  </SvgIcon>
)
```

## 3. product（Figma 组件类型）

**识别方式**：Figma 中组件名为 `product`，变体属性为 `product=xxx`

**处理方式**：
- 在 `src/components/ui/icons/set/product/` 目录下创建 SVG 组件
- 文件名使用 `product` 变体属性值（kebab-case）
- 使用 `react-native-svg` 和 `SvgIcon` 包装器
- 钱包相关图标放在 `set/wallet/` 子目录

**示例**（`set/wallet/metamask.tsx`）：
```tsx
import { Path, G, Defs, ClipPath, Rect } from "react-native-svg"
import { SvgIcon, SvgIconProps } from "../../svg-icon"

export const IconMetamask = (props: SvgIconProps) => (
  <SvgIcon width='24' height='24' viewBox='0 0 24 24' fill="none" {...props}>
    <Path ... />
  </SvgIcon>
)
```

## 图标命名规范

| Figma 组件类型 | 目录位置 | 导出名称格式 |
|---------------|---------|-------------|
| iconoir-icon | `iconify.tsx` | `IconifyXxx` |
| special-icon | `set/xxx.tsx` | `IconXxx` |
| product | `set/product/xxx.tsx` | `IconXxx` |

## 样式变量

使用 `global.css` 中定义的 CSS 变量保持与 Figma 设计同步：
- 间距：`px-xl`, `py-medium`, `gap-small` 等
- 圆角：`rounded-small`, `rounded-medium` 等
- 颜色：`bg-brand-default`, `border-brand-default`, `text-brand-primary` 等
