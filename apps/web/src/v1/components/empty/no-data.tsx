import { IconEmptyNoData } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/utils'

export const EmptyNoData = ({ className }: { className?: string }) => {
  return (
    <div className={cn('py-2xl mx-auto flex h-full flex-col items-center justify-center', className)}>
      <IconEmptyNoData className="text-brand-secondary-1" />
      <div className="text-paragraph-p3 text-content-6 mt-2">暂无记录</div>
    </div>
  )
}
