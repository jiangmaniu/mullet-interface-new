import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

interface DepositMethodCardProps {
	icon: React.ReactNode;
	title: React.ReactNode;
	subtitle: React.ReactNode;
	rightContent?: React.ReactNode | null;
	onPress: () => void;
	disabled?: boolean;
}

export function DepositMethodCard({
	icon,
	title,
	subtitle,
	rightContent,
	onPress,
	disabled,
}: DepositMethodCardProps) {
	return (
		<Pressable onPress={onPress} disabled={disabled}>
			<Card className="rounded-small" style={disabled ? { opacity: 0.5 } : undefined}>
				<CardContent className="py-medium px-xl flex-row items-center justify-between">
					<View className="flex-row items-center gap-medium">
						{icon}
						<View className="gap-xs">
							<Text className="text-paragraph-p2 text-content-1">{title}</Text>
							<Text className="text-paragraph-p3 text-content-4">{subtitle}</Text>
						</View>
					</View>
					{rightContent}
				</CardContent>
			</Card>
		</Pressable>
	);
}
