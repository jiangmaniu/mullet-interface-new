import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Trans, useLingui } from '@lingui/react/macro'
import { i18n } from '@lingui/core'
import { isInAppSync, getContextSync, getThemeSync } from '@mullet/js-bridge/h5'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark')
  return isDark ? 'dark' : 'light'
}

function toggleLocale() {
  const next = i18n.locale === 'zh-cn' ? 'en' : 'zh-cn'
  i18n.activate(next)
}

function HomePage() {
  const { i18n: lingui } = useLingui()
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  const ctx = getContextSync()

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl font-bold text-primary">
        <Trans>调试面板</Trans>
      </h1>

      {/* 环境 */}
      <section className="bg-card rounded-lg p-4 text-sm space-y-1">
        <p className="text-muted-foreground font-medium">环境</p>
        <p>isInApp: <span className="text-primary">{String(isInAppSync())}</span></p>
        <p>locale (bridge): <span className="text-primary">{ctx?.locale ?? '-'}</span></p>
        <p>theme (bridge): <span className="text-primary">{isInAppSync() ? getThemeSync() : '-'}</span></p>
      </section>

      {/* 主题 */}
      <section className="bg-card rounded-lg p-4 space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          <Trans>主题</Trans>
        </p>
        <p className="text-sm">当前: <span className="text-primary">{theme}</span></p>
        <Button onPress={() => setTheme(toggleTheme())}>
          <Trans>切换主题</Trans>
        </Button>
      </section>

      {/* 国际化 */}
      <section className="bg-card rounded-lg p-4 space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          <Trans>国际化</Trans>
        </p>
        <p className="text-sm">当前: <span className="text-primary">{lingui.locale}</span></p>
        <p className="text-sm"><Trans>你好，世界</Trans></p>
        <Button onPress={toggleLocale}>
          <Trans>切换语言</Trans>
        </Button>
      </section>
    </div>
  )
}
