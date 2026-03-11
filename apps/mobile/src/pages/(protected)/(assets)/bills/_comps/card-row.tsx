import { Trans } from '@lingui/react/macro'
import React from 'react'
import { View } from 'react-native'

import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'

// Row Component for consistent styling
export interface BillsCardRowProps {
  label: React.ReactNode
  value?: React.ReactNode
  valueComponent?: React.ReactNode
}

export const BillsCardRow = ({ label, value, valueComponent }: BillsCardRowProps) => {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      {valueComponent || <Text className="text-paragraph-p3 text-content-1">{value}</Text>}
    </View>
  )
}

export function BillsCardStatusBadge({ status }: { status: 'success' | 'failed' }) {
  return (
    <Text
      className={status === 'success' ? 'text-market-rise text-paragraph-p3' : 'text-market-fall text-paragraph-p3'}
    >
      {status === 'success' ? <Trans>成功</Trans> : <Trans>失败</Trans>}
    </Text>
  )
}

// Account Type Badge
export function AccountTypeBadge({ type }: { type: string }) {
  return (
    <Badge color="default">
      <Text>{type}</Text>
    </Badge>
  )
}
