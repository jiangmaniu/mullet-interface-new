import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { IconifySearch } from '@/components/ui/icons/iconify';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export interface Currency {
	code: string;
	name: string;
	symbol: string;
}

export const CURRENCIES: Currency[] = [
	{ code: 'HK', name: 'Hong Kong Dollar ($)', symbol: '$' },
	{ code: 'US', name: 'US Dollar ($)', symbol: '$' },
	{ code: 'EU', name: 'Euro (€)', symbol: '€' },
	{ code: 'GB', name: 'British Pound (£)', symbol: '£' },
	{ code: 'JP', name: 'Japanese Yen (¥)', symbol: '¥' },
	{ code: 'CN', name: 'Chinese Yuan (¥)', symbol: '¥' },
	{ code: 'KR', name: 'Korean Won (₩)', symbol: '₩' },
	{ code: 'SG', name: 'Singapore Dollar ($)', symbol: '$' },
	{ code: 'AU', name: 'Australian Dollar ($)', symbol: '$' },
	{ code: 'CA', name: 'Canadian Dollar ($)', symbol: '$' },
];

interface CurrencySelectionDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedCode: string;
	onSelect: (code: string) => void;
}

export function CurrencySelectionDrawer({
	visible,
	onClose,
	selectedCode,
	onSelect,
}: CurrencySelectionDrawerProps) {
	const [search, setSearch] = useState('');

	const filtered = CURRENCIES.filter(
		(c) =>
			c.code.toLowerCase().includes(search.toLowerCase()) ||
			c.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className="py-3xl gap-0">
				<View className="w-full">
					{/* Search input */}
					<View className="px-5">
						<Input
							placeholder="查询"
							hideLabel
							value={search}
							onValueChange={setSearch}
							size="sm"
							LeftContent={<IconifySearch width={20} height={20} />}
						/>
					</View>

					{/* Currency list */}
					<ScrollView className="max-h-[400px]" showsVerticalScrollIndicator={false}>
						{filtered.map((currency) => (
							<Pressable
								key={currency.code}
								onPress={() => {
									onSelect(currency.code);
									onClose();
								}}
								className="flex-row items-center justify-between overflow-hidden px-5 py-[14px]"
							>
								<View className="flex-row items-center gap-medium">
									<Text className="text-paragraph-p4 text-content-1">
										{currency.code}
									</Text>
									<Text className="text-paragraph-p2 text-content-1">
										{currency.name}
									</Text>
								</View>
								<Checkbox
									checked={currency.code === selectedCode}
									onCheckedChange={() => {
										onSelect(currency.code);
										onClose();
									}}
								/>
							</Pressable>
						))}
					</ScrollView>
				</View>
			</DrawerContent>
		</Drawer>
	);
}
