import GlobalBg from './_layout/bg'
import { MainLayoutHeader } from './_layout/header'
import { PageLoadingWrapper } from './_layout/page-loading-wrapper'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLoadingWrapper>
      <div className="relative flex flex-col">
        <MainLayoutHeader />

        <div className="flex-1 overflow-auto">{children}</div>

        <GlobalBg />
      </div>
    </PageLoadingWrapper>
  )
}
