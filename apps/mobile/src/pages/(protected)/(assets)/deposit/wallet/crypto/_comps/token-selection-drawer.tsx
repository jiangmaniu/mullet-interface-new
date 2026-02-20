import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { Text } from '@/components/ui/text';
import { Pressable, ScrollView } from 'react-native';

export interface Token {
	id: string;
	name: string;
	icon: React.ReactNode;
}

export const TOKENS: Token[] = [
	{ id: 'usdc-arb', name: 'USDC', icon: <IconUSDC1 width={16} height={16} /> },
	{ id: 'usdc-eth', name: 'USDC', icon: <IconUSDC1 width={16} height={16} /> },
	{ id: 'usdc-sol', name: 'USDC', icon: <IconUSDC1 width={16} height={16} /> },
];

interface TokenSelectionDrawerProps {
	visible: boolean;
	onClose: () => void;
	selectedTokenId: string;
	onSelect: (id: string) => void;
}

export function TokenSelectionDrawer({
	visible,
	onClose,
	selectedTokenId,
	onSelect,
}: TokenSelectionDrawerProps) {
	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className="h-[204px]">
				<ScrollView className="flex-1 pt-xl pb-3xl" showsVerticalScrollIndicator={false}>
					{TOKENS.map((token) => (
						<Pressable
							key={token.id}
							onPress={() => onSelect(token.id)}
							className="flex-row items-center px-5 py-[14px]"
						>
							{token.icon}
							<Text className="flex-1 text-paragraph-p2 text-content-1 ml-medium">
								{token.name}
							</Text>
							<Checkbox
								checked={token.id === selectedTokenId}
								onCheckedChange={() => onSelect(token.id)}
							/>
						</Pressable>
					))}
				</ScrollView>
			</DrawerContent>
		</Drawer>
	);
}
