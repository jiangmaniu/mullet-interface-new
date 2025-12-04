import { Icon, IconProps } from '@iconify/react'

export const Iconify = ({ icon, className, ...props }: IconProps) => {
  return <Icon icon={icon} className={className} {...props} />
}
