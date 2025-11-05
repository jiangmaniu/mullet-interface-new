import { cn } from '@mullet/ui/lib/utils'

export type SvgIconProps = React.SVGAttributes<HTMLOrSVGElement>

export const SvgIcon = ({ children, className, ...props }: SvgIconProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cn('w-[1em]', 'h-[1em]', 'fill-current', className)} {...props}>
      {children}
    </svg>
  )
}
