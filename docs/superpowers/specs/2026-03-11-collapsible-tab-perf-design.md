# CollapsibleTab 动画性能优化设计

## 问题描述

`collapsible-tab.tsx` 组件在所有交互场景（快速滑动、Tab 切换、Header 收起/展开、手势拖动）中均存在明显掉帧。

## 根因分析

1. **缺少 Reanimated Babel 插件**：worklet 转换不完整，部分动画回退到 JS 线程
2. **`interpolateColor` 性能开销大**：每个 Tab 每帧都执行颜色插值
3. **重复计算**：多个 `useAnimatedStyle` 中存在相同的 `interpolate` 计算
4. **手势回调过于频繁**：`scrollTo` 每帧都调用，无防抖
5. **缺少 `React.memo`**：CustomTabItem 在父组件重渲染时被不必要地重渲染

## 优化方案

### 1. Babel 配置（babel.config.js）

添加 `react-native-reanimated/plugin` 到 plugins 末尾。

### 2. CustomTabItem 优化（collapsible-tab.tsx）

- 用 `useDerivedValue` 缓存 distance 计算
- 用 `opacity` + 固定颜色替代 `interpolateColor`
- 用 `React.memo` 包裹组件

### 3. CollapsibleStickyNavBar 优化（collapsible-tab.tsx）

- 用 `useDerivedValue` 提取 `translateY` 和 `opacity` 计算
- 合并两个 `useAnimatedStyle` 为更简洁的形式
- 减少 worklet 中的条件分支

### 4. CollapsibleStickyHeader 手势优化（collapsible-tab.tsx）

- 手势 `onUpdate` 添加 1px 阈值防抖
- `useAnimatedReaction` 添加 `previousValue` 比较，避免重复触发

### 5. MaterialTabBar 渲染优化（collapsible-tab.tsx）

- 添加 `pressColor="transparent"` 减少不必要的涟漪动画重绘

## 影响文件

- `apps/mobile/babel.config.js`
- `apps/mobile/src/components/ui/collapsible-tab.tsx`

## 风险

- `opacity` 替代 `interpolateColor` 可能导致视觉差异（低风险，可调参数）
- 手势防抖阈值需实机测试调整（低风险）
