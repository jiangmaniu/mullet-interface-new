import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Text } from '@/components/ui/text';
import { Image, Pressable, ScrollView, View } from 'react-native';

export interface Channel {
	id: string;
	name: string;
	icon: string;
	priceUsd: string;
	priceLocal: string;
}

export const CHANNELS: Channel[] = [
	{
		id: 'alchemy-pay',
		name: 'Alchemy Pay',
		icon: 'https://www.figma.com/api/mcp/asset/c06fb52f-a3a8-469b-81bb-0427ba80db1c',
		priceUsd: '$153,568.00',
		priceLocal: 'HK $1,000.00',
	},
	{
		id: 'moonpay',
		name: 'MoonPay',
		icon: 'https://www.figma.com/api/mcp/asset/c06fb52f-a3a8-469b-81bb-0427ba80db1c',
		priceUsd: '$153,568.00',
		priceLocal: 'HK $1,000.00',
	},
	{
		id: 'transak',
		name: 'Transak',
		icon: 'https://www.figma.com/api/mcp/asset/c06fb52f-a3a8-469b-81bb-0427ba80db1c',
		priceUsd: '$153,568.00',
		priceLocal: 'HK $1,000.00',
	},
];

interface ChannelSelectionDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedId: string;
	onSelect: (id: string) => void;
}

export function ChannelSelectionDrawer({
	visible,
	onClose,
	selectedId,
	onSelect,
}: ChannelSelectionDrawerProps) {
	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className="py-3xl gap-xl items-center">
				<ScrollView
					className="w-full max-h-[400px]"
					showsVerticalScrollIndicator={false}
					contentContainerClassName="items-center gap-xl"
				>
					{CHANNELS.map((channel) => {
						const isSelected = channel.id === selectedId;
						return (
							<Pressable
								key={channel.id}
								onPress={() => {
									onSelect(channel.id);
									onClose();
								}}
								className={`flex-row items-center justify-between px-xl py-medium rounded-small w-[328px] ${isSelected ? 'border border-white' : ''}`}
							>
								<View className="flex-row items-center gap-medium">
									<Image
										source={{ uri: channel.icon }}
										className="size-6 rounded-full overflow-hidden"
									/>
									<Text className="text-paragraph-p2 text-content-1">
										{channel.name}
									</Text>
								</View>
								<View className="items-end justify-center">
									<Text className="text-paragraph-p2 text-content-1">
										{channel.priceUsd}
									</Text>
									<Text className="text-paragraph-p3 text-content-4">
										{channel.priceLocal}
									</Text>
								</View>
							</Pressable>
						);
					})}
				</ScrollView>
			</DrawerContent>
		</Drawer>
	);
}
