'use client'

import { useState } from 'react'

import { Button } from '@mullet/ui/button'

import { SettingLeverageModal } from './_comps/setting-leverage-modal'

export default function TradePage() {
  const [leverage, setLeverage] = useState(1)
  return (
    <div>
      TradePage
      <SettingLeverageModal>
        <Button>{leverage}x</Button>
      </SettingLeverageModal>
    </div>
  )
}
