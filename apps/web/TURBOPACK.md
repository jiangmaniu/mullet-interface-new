# Turbopack 配置指南

本项目使用 **Turbopack** 作为构建工具，替代传统的 Webpack。

## 🚀 什么是 Turbopack？

Turbopack 是 Vercel 开发的新一代 JavaScript 打包工具，用 Rust 编写，速度比 Webpack 快 **700 倍**。

## ⚙️ 当前配置

### 开发环境

```bash
pnpm dev # 使用 --turbopack 标志
```

### 生产构建

```bash
pnpm build # 使用 --turbo 标志
```

## 📦 SVG 使用方式

Turbopack 原生支持 SVG，无需额外配置。

### 1. 作为 URL（默认）

```tsx
import logoUrl from '@/assets/logo.svg'

;<img src={logoUrl} alt="Logo" className="h-20 w-20" />
```

### 2. 作为 React 组件（推荐）

使用 `?react` 后缀：

```tsx
import Logo from '@/assets/logo.svg?react'

;<Logo className="h-20 w-20 text-blue-500" />
```

### 3. 显式作为 URL

使用 `?url` 后缀（与 Next.js Image 配合）：

```tsx
import Image from 'next/image'

import logoUrl from '@/assets/logo.svg?url'

;<Image src={logoUrl} alt="Logo" width={80} height={80} />
```

## 🎨 完整示例

```tsx
// 示例组件
import IconClose from '@/assets/icons/close.svg?react'
import Logo from '@/assets/logo.svg?react'

export default function MyComponent() {
  return (
    <div>
      {/* 作为组件使用，支持 props */}
      <Logo className="h-10 w-10 text-blue-500" fill="currentColor" onClick={() => console.log('clicked')} />

      {/* 支持 Tailwind CSS */}
      <IconClose className="h-6 w-6 cursor-pointer hover:text-red-500" />

      {/* 可以动态修改颜色 */}
      <Logo className="h-8 w-8" style={{ fill: '#FF0000' }} />
    </div>
  )
}
```

## 📁 推荐目录结构

```
apps/web/
├── public/
│   └── images/          # 静态图片
│       └── logo.png
├── src/
│   ├── assets/
│   │   ├── icons/       # SVG 图标
│   │   │   ├── close.svg
│   │   │   └── menu.svg
│   │   └── images/      # 其他资源
│   │       └── banner.svg
│   └── components/
```

## 🔧 Turbopack vs Webpack

| 特性           | Turbopack | Webpack  |
| -------------- | --------- | -------- |
| **速度**       | ⚡️ 极快  | 🐌 较慢  |
| **热更新**     | ~1ms      | ~500ms   |
| **配置复杂度** | 简单      | 复杂     |
| **SVG 支持**   | 原生      | 需要插件 |
| **生态系统**   | 新兴      | 成熟     |

## ⚠️ 注意事项

### 1. 不支持 webpack 配置

Turbopack 不支持 `webpack()` 配置块，需要使用 Turbopack 原生功能。

```typescript
// ❌ 不支持
const nextConfig = {
  webpack(config) {
    // ...
  },
}

// ✅ 使用 Turbopack 原生功能
const nextConfig = {
  // Turbopack 配置
}
```

### 2. 插件兼容性

部分 Webpack 插件不兼容 Turbopack，需要寻找替代方案：

- ❌ `@svgr/webpack` - 不需要，Turbopack 原生支持
- ❌ `webpack-bundle-analyzer` - 使用 Next.js 内置分析
- ✅ PostCSS 插件 - 完全兼容
- ✅ Babel 插件 - 部分兼容

### 3. 环境变量

环境变量使用方式与 Webpack 一致：

```typescript
// .env.local
NEXT_PUBLIC_API_URL=https://api.example.com

// 使用
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

## 🎯 性能优化建议

### 1. 使用动态导入

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

### 2. 图片优化

```tsx
import Image from 'next/image'

;<Image
  src="/banner.svg"
  alt="Banner"
  width={800}
  height={400}
  priority // 关键图片优先加载
/>
```

### 3. SVG 优化

对于频繁使用的图标，建议：

- 使用 SVG sprite
- 或者使用图标库（如 lucide-react）

```tsx
import { Heart, Star, User } from 'lucide-react'

;<Heart className="h-6 w-6 text-red-500" />
```

## 🐛 常见问题

### Q: SVG 导入报错？

**A:** 确保已配置 TypeScript 类型定义（`src/types/svg.d.ts`）

### Q: 热更新不生效？

**A:** 重启开发服务器：

```bash
pnpm dev
```

### Q: 构建速度慢？

**A:** 确保使用了 `--turbo` 标志：

```json
{
  "scripts": {
    "build": "next build --turbo"
  }
}
```

### Q: 需要使用 Webpack 插件？

**A:** 检查是否有 Turbopack 替代方案，或临时移除 `--turbopack` 标志。

## 📚 参考资源

- [Turbopack 官方文档](https://turbo.build/pack)
- [Next.js Turbopack 文档](https://nextjs.org/docs/architecture/turbopack)
- [迁移指南](https://nextjs.org/docs/architecture/turbopack#migrating-from-webpack-to-turbopack)

## 🎉 总结

使用 Turbopack 的优势：

- ✅ **超快的开发体验**：热更新几乎瞬时完成
- ✅ **简化配置**：无需复杂的 Webpack 配置
- ✅ **原生 SVG 支持**：无需额外插件
- ✅ **未来趋势**：Next.js 官方推荐
