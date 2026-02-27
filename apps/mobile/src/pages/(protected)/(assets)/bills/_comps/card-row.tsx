import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

// Row Component for consistent styling
export interface BillsCardRowProps {
  label: React.ReactNode;
  value?: React.ReactNode;
  valueComponent?: React.ReactNode;
}

export const BillsCardRow = ({ label, value, valueComponent }: BillsCardRowProps) => {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      {valueComponent || <Text className="text-paragraph-p3 text-content-1">{value}</Text>}
    </View>
  );
}

export function BillsCardStatusBadge({ status }: { status: 'success' | 'failed' }) {
  return (
    <Text className={status === 'success' ? 'text-market-rise text-paragraph-p3' : 'text-market-fall text-paragraph-p3'}>
      {status === 'success' ? <Trans>成功</Trans> : <Trans>失败</Trans>}
    </Text>
  );
}

// MetaMask Icon Component
export function MetaMaskIcon({ width = 20, height = 20 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect width="24" height="24" rx="4" fill="#F5841F" />
      <Path
        d="M18.5 5L12.5 9.5L13.5 7L18.5 5Z"
        fill="#E17726"
        stroke="#E17726"
        strokeWidth="0.25"
      />
      <Path
        d="M5.5 5L11.4 9.55L10.5 7L5.5 5Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
      />
      <Path
        d="M16.2 15.5L14.5 18.2L18 19.2L19 15.6L16.2 15.5Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
      />
      <Path
        d="M5 15.6L6 19.2L9.5 18.2L7.8 15.5L5 15.6Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
      />
      <Path
        d="M9.3 11L8.3 12.5L11.8 12.7L11.7 9L9.3 11Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
      />
      <Path
        d="M14.7 11L12.2 8.9L12.2 12.7L15.7 12.5L14.7 11Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
      />
      <Path
        d="M9.5 18.2L11.6 17.1L9.8 15.6L9.5 18.2Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
      />
      <Path
        d="M12.4 17.1L14.5 18.2L14.2 15.6L12.4 17.1Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
      />
    </Svg>
  );
}


// Account Type Badge
export function AccountTypeBadge({ type }: { type: string }) {
  return (
    <Badge color="default">
      <Text>{type}</Text>
    </Badge>
  );
}
