# 页面布局规范

## className 组织规范

使用 `cn` 函数组织 className，按照 Tailwind 样式类的类别分组：

```tsx
import { cn } from '@/lib/utils'

// 按类别分组：布局 -> 间距 -> 尺寸 -> 背景 -> 文字
<View className={cn('flex-1', 'px-3xl', 'gap-xl', 'bg-secondary')} />

// 文字样式
<Text className={cn('text-left', 'text-content-5', 'text-paragraph-p3')} />

// 复杂布局
<View className={cn('flex-row', 'items-center', 'justify-center', 'gap-2xl', 'pt-xl')} />
```

### 类别顺序

1. **布局类**：`flex`, `flex-row`, `flex-1`, `items-center`, `justify-center`
2. **间距类**：`px-xl`, `py-3`, `gap-xl`, `pt-xl`, `px-small`
3. **尺寸类**：`w-full`, `h-px`
4. **背景类**：`bg-secondary`, `bg-brand-divider-line`
5. **边框类**：`border`, `border-brand-default`, `rounded-small`
6. **文字类**：`text-left`, `text-content-5`, `text-paragraph-p3`

## 页面结构

标准页面结构如下：

```tsx
<View className="flex-1 bg-brand-default">
  {/* Header */}
  <ScreenHeader content="页面标题" />

  {/* 页面内容 */}
  <View className="flex-1 px-3xl">
    {/* 内容区域 */}
  </View>
</View>
```

## ScreenHeader 组件

使用 `@/components/ui/screen-header` 组件作为页面头部：

```tsx
import { ScreenHeader } from '@/components/ui/screen-header'

// 基本用法
<ScreenHeader content="页面标题" />

// 自定义返回按钮行为
<ScreenHeader content="页面标题" onBack={() => router.back()} />

// 隐藏返回按钮
<ScreenHeader content="页面标题" showBackButton={false} />

// 自定义左右内容
<ScreenHeader
  content="页面标题"
  left={<CustomLeftComponent />}
  right={<CustomRightComponent />}
/>
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| content | string \| ReactNode | - | 标题内容 |
| showBackButton | boolean | true | 是否显示返回按钮 |
| onBack | () => void | - | 自定义返回行为 |
| left | ReactNode | - | 自定义左侧内容 |
| right | ReactNode | - | 自定义右侧内容 |
| className | string | - | 自定义样式类 |

## 常用样式类

### 背景色
- `bg-secondary` - 次要页面背景色（对应 `--Colors-background-secondary`）
- `bg-brand-default` - 默认品牌背景色

### 文字颜色
- `text-content-1` - 主要文字颜色
- `text-content-2` - 次要文字颜色
- `text-content-3` - 辅助文字颜色
- `text-content-4` - 弱化文字颜色（对应 `--Colors-text-content-4`，如分割线文字、免责声明）

### 间距
- `px-3xl` - 页面水平内边距
- `px-xl` - 组件水平内边距
- `py-xl` - 垂直内边距
- `gap-xl` - 元素间距
- `gap-medium` - 中等间距
- `gap-small` - 小间距

### 分割线
```tsx
<View className="flex-row items-center w-full">
  <View className="flex-1 h-px bg-brand-divider-line" />
  <View className="bg-brand-default px-small">
    <Text className="text-content-3 text-paragraph-p3">分割文字</Text>
  </View>
  <View className="flex-1 h-px bg-brand-divider-line" />
</View>
```

### 按钮边框
- `border border-brand-default` - 默认边框样式
- `rounded-small` - 小圆角（8px）
