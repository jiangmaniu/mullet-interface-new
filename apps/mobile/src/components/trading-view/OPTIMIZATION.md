# AreaChart 性能优化说明

## 优化内容

### 1. AreaChart 组件优化

#### 数据序列化缓存
- 使用 `WeakMap` 缓存 `JSON.stringify` 结果
- 避免相同数据重复序列化
- 自动垃圾回收，不会造成内存泄漏

#### React.memo 深度比较
- 实现自定义比较函数 `arePropsEqual`
- 只比较首尾数据点，避免遍历整个数组
- 显著减少不必要的重渲染

### 2. ChartBase 组件优化

#### 加载状态管理
- 添加 `isLoading` 和 `isReady` 状态
- 显示 ActivityIndicator 骨架屏
- WebView 加载完成后平滑过渡

#### 渲染优化
- 使用 `useCallback` 缓存事件处理函数
- WebView 加载时隐藏，加载完成后显示
- 减少布局抖动

#### WebView 性能配置
- 禁用页面缩放 `scalesPageToFit={false}`
- 禁用媒体播放 `allowsInlineMediaPlayback={false}`
- 启用缓存 `cacheMode="LOAD_CACHE_ELSE_NETWORK"`

### 3. WebView 池化

#### HTML 内容缓存
- 创建 `WebViewPoolProvider` 上下文
- 使用 `Map` 缓存生成的 HTML
- 避免重复生成相同的 HTML 字符串

## 使用方法

### 基础使用（无需修改现有代码）

```tsx
import { AreaChart } from '@/components/trading-view/area-chart'

<AreaChart
  data={chartData}
  lineColor="#2962FF"
  topColor="rgba(41, 98, 255, 0.3)"
  bottomColor="transparent"
/>
```

### 高级使用（启用 WebView 池化）

在应用根组件包裹 `WebViewPoolProvider`：

```tsx
import { WebViewPoolProvider } from '@/components/trading-view/webview-pool'

function App() {
  return (
    <WebViewPoolProvider>
      {/* 你的应用内容 */}
    </WebViewPoolProvider>
  )
}
```

## 性能提升

### 优化前
- 数据更新时重复序列化
- 每次 props 变化都重新渲染
- WebView 加载时白屏
- 路由切换时卡顿

### 优化后
- ✅ 数据序列化缓存，减少 CPU 开销
- ✅ 智能比较，避免不必要的重渲染
- ✅ 骨架屏过渡，消除白屏
- ✅ HTML 缓存，加快 WebView 初始化
- ✅ 平滑的加载动画

## 预期效果

1. **首次渲染**：显示加载动画，100ms 后平滑显示图表
2. **数据更新**：相同数据不重新渲染，不同数据快速更新
3. **路由切换**：无白屏，流畅过渡
4. **内存占用**：WeakMap 自动回收，无内存泄漏

## 注意事项

- 所有优化都是向后兼容的
- 无需修改现有代码即可获得性能提升
- 可选启用 WebViewPoolProvider 获得更好性能
