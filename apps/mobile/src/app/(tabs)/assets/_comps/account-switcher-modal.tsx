import { IconifyUserCircle } from '@/components/ui/icons';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';

const REAL_ACCOUNTS = [
	{ id: '88234911', type: 'STP' as const, balance: '10,234.50', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234912', type: 'STP' as const, balance: '5,000.00', currency: 'USD', leverage: '100', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x1A2B...C3D4' },
	{ id: '88234933', type: 'STP' as const, balance: '10,234.50', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234954', type: 'STP' as const, balance: '5,000.00', currency: 'USD', leverage: '100', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x1A2B...C3D4' },
	{ id: '88234965', type: 'STP' as const, balance: '10,234.50', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234976', type: 'STP' as const, balance: '5,000.00', currency: 'USD', leverage: '100', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x1A2B...C3D4' },
]

const MOCK_ACCOUNTS = [
	{ id: '10023491', type: '热门' as const, balance: '100,000.00', currency: 'USD', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Demo', address: '0x0000...0000' },
]

export function AccountSwitcherModal({
	visible,
	onClose
}: {
	visible: boolean
	onClose: () => void
}) {
	const [activeTab, setActiveTab] = useState('real');

	return (

		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className='p-0'>
				<View className="h-[292px]">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList variant="underline" size="md" className='w-screen my-xl flex-shrink-0'>
							<TabsTrigger value="real" className='flex-1'>
								<Text className={cn('text-button-2 text-content-4', activeTab === 'real' && 'text-content-1')}><Trans>真实账户</Trans></Text>
							</TabsTrigger>
							<TabsTrigger value="mock" className='flex-1'>
								<Text className={cn('text-button-2 text-content-4', activeTab === 'mock' && 'text-content-1')}><Trans>模拟账户</Trans></Text>
							</TabsTrigger>
						</TabsList>
					</Tabs>

					<ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
						{activeTab === 'real' ? REAL_ACCOUNTS.map(account => (
							<AccountRow isReal key={account.id} {...account} onPress={() => { }} />
						)) : MOCK_ACCOUNTS.map(account => (
							<AccountRow isReal={false} key={account.id} {...account} onPress={() => { }} />
						))}

					</ScrollView>
				</View>
			</DrawerContent>
		</Drawer>
	);
}

interface AccountRowProps {
	id: string
	type: 'STP' | '热门'
	balance: string
	currency: string
	isReal?: boolean
	address?: string
	onPress?: () => void
}

export function AccountRow({
	id,
	type,
	balance,
	currency,
	isReal = true,
	onPress
}: AccountRowProps) {
	const { textColorContent1 } = useThemeColors()

	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.7}>
			<Card className='border-0'>
				<CardContent className='px-5 py-[14px] flex-row items-center justify-between'>
					<View className='gap-xs'>
						{/* Header: User & Badges */}
						<View className="flex-row items-center justify-between gap-medium">
							<View className="flex-row items-center gap-xs">
								<IconifyUserCircle width={20} height={20} color={textColorContent1} />
								<Text className="text-paragraph-p2 text-content-1">{id}</Text>
							</View>

							<View className="flex-row items-center gap-medium">
								<Badge color={isReal ? 'rise' : 'secondary'} >
									<Text>{isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
								</Badge>
								<Badge color='default'>
									<Text>{type.toUpperCase()}</Text>
								</Badge>
							</View>
						</View>

						{/* Balance */}
						<View className="min-h-[24px] flex-row gap-xs">
							<Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
							<Text className="text-paragraph-p3 text-content-1">{balance} {currency}</Text>
						</View>
					</View>

					<Checkbox checked={false} onCheckedChange={() => { }} />
				</CardContent>
			</Card>
		</TouchableOpacity>
	)
}
