import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { IconifyCreditCardSolid } from '@/components/ui/icons/iconify';
import { IconVisa } from '@/components/ui/icons/set/visa';
import { IconMastercard } from '@/components/ui/icons/set/mastercard';
import { Trans } from '@lingui/react/macro';
import { View } from 'react-native';
import { DepositMethodCard } from '../method-card';

export function BankDepositCard() {
	return (
		<DepositMethodCard
			icon={<IconifyCreditCardSolid width={24} height={24} className="text-content-1" />}
			title={
				<View className="flex-row items-center gap-medium">
					<Text className="text-paragraph-p2 text-content-1"><Trans>银行卡</Trans></Text>
					<Badge color="default"><Text><Trans>暂未开放</Trans></Text></Badge>
				</View>
			}
			subtitle={<Trans>最低$1000 · 5分钟</Trans>}
			rightContent={
				<View className="flex-row items-center gap-medium">
					<IconVisa width={24} height={24} />
					<IconMastercard width={24} height={24} />
				</View>
			}
			onPress={() => { }}
			disabled
		/>
	);
}
