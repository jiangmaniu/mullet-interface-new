import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  /** 顶部导航栏 */
  header?: ReactNode
  /** 底部 Tab 栏 */
  footer?: ReactNode
  /** 自定义 className */
  className?: string
  /**
   * 是否启用安全区域内边距
   * - true: 同时启用顶部和底部
   * - 'top': 仅顶部
   * - 'bottom': 仅底部
   * - false: 不启用
   * @default true
   */
  safeArea?: boolean | 'top' | 'bottom'
}

/**
 * 移动端通用布局容器
 *
 * 已在 index.html 中配置 viewport-fit=cover 以适配 iPhone 刘海屏。
 * 此组件通过 env(safe-area-inset-*) 自动处理安全区域内边距，
 * 确保内容不会被刘海、底部横条遮挡。
 *
 * @example
 * ```tsx
 * // 基础用法 — 自动处理上下安全区域
 * <Layout>
 *   <PageContent />
 * </Layout>
 *
 * // 带 Header + Footer
 * <Layout header={<NavBar title="首页" />} footer={<TabBar />}>
 *   <PageContent />
 * </Layout>
 *
 * // 仅底部安全区域（Header 自己处理顶部）
 * <Layout safeArea="bottom">
 *   <PageContent />
 * </Layout>
 * ```
 */
export function Layout({
  children,
  header,
  footer,
  className,
  safeArea = true,
}: LayoutProps) {
  const hasSafeTop = safeArea === true || safeArea === 'top'
  const hasSafeBottom = safeArea === true || safeArea === 'bottom'

  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col bg-background text-foreground',
        className,
      )}
    >
      {/* 顶部安全区域填充 */}
      {hasSafeTop && <div className="pt-safe shrink-0" />}

      {/* Header */}
      {header && <header className="shrink-0">{header}</header>}

      {/* 主内容区域 — flex-1 撑满剩余空间 */}
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>

      {/* Footer */}
      {footer && <footer className="shrink-0">{footer}</footer>}

      {/* 底部安全区域填充 */}
      {hasSafeBottom && <div className="pb-safe shrink-0" />}
    </div>
  )
}
