'use client'

import { Trans } from '@lingui/react/macro'
import Link from 'next/link'

import { Button } from '@mullet/ui/button'

export default function NotFound() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-7">
        <h2 className="text-6xl">404</h2>
        <div className="text-center">
          <p>
            <Trans>Sorry, the page you are trying to access does not exist</Trans>
          </p>
          <p className="text-xs text-[#848d9b]">
            <Trans>The page you are trying to view is temporarily unavailable. Please try again later</Trans>
          </p>
        </div>
        <Link href="/trade">
          <Button>
            <Trans>Return trade</Trans>
          </Button>
        </Link>
      </div>
    </div>
  )
}
