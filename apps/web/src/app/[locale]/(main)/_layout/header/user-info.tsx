import Link from 'next/link'

import { Trans } from '@/components/t'
import { GeneralTooltip } from '@/components/tooltip/general'
import { IconButton } from '@mullet/ui/button'
import { Iconify } from '@mullet/ui/icons'

export const UserInfo = () => {
  return (
    <div>
      <GeneralTooltip content={<Trans>账户中心</Trans>}>
        <Link href={{ pathname: '/account' }}>
          <IconButton className="size-9">
            <Iconify icon="iconoir:user" className="size-5 text-white" />
            <span className="sr-only">User Info</span>
          </IconButton>
        </Link>
      </GeneralTooltip>
    </div>
  )
}
