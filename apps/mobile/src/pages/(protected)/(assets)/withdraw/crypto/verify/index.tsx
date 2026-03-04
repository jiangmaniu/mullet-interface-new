import { Button } from '@/components/ui/button';
import { IconifyEmail } from '@/components/ui/icons/iconify';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WithdrawStatusModal } from '../../_comps/withdraw-status-modal';

const MOCK_EMAIL = 'user@example.com';
const CODE_LENGTH = 6;

export default function VerifyScreen() {
	const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const handleCodeChange = useCallback((text: string, index: number) => {
		const digit = text.replace(/[^0-9]/g, '').slice(-1);
		const newCode = [...code];
		newCode[index] = digit;
		setCode(newCode);

		if (digit && index < CODE_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	}, [code]);

	const handleKeyPress = useCallback((e: any, index: number) => {
		if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	}, [code]);

	const handleResend = useCallback(() => {
		// TODO: 重新发送验证码
	}, []);

	const handleConfirm = useCallback(() => {
		setShowSuccessModal(true);
	}, []);

	const handleCloseSuccessModal = useCallback(() => {
		setShowSuccessModal(false);
		router.replace('/(tabs)/assets');
	}, []);

	const isCodeComplete = code.every((digit) => digit !== '');

	return (
		<View className="flex-1">
			<ScreenHeader content={<Trans>安全验证</Trans>} />

			<View className="flex-1 px-5 pt-4xl gap-4xl">
				<View className="items-center gap-xl">
					<IconifyEmail width={48} height={48} className="text-brand-support" />
					<Text className="text-paragraph-p1 text-content-1">
						<Trans>请输入邮箱验证码</Trans>
					</Text>
					<Text className="text-paragraph-p3 text-content-4 text-center">
						<Trans>
							我们已向 {MOCK_EMAIL} 发送了验证码，请查收并输入
						</Trans>
					</Text>
				</View>

				<View className="gap-xl">
					<View className="flex-row items-center justify-center gap-medium">
						{code.map((digit, index) => (
							<TextInput
								key={index}
								ref={(ref) => (inputRefs.current[index] = ref)}
								value={digit}
								onChangeText={(text) => handleCodeChange(text, index)}
								onKeyPress={(e) => handleKeyPress(e, index)}
								keyboardType="number-pad"
								maxLength={1}
								className="w-12 h-14 text-center text-paragraph-p1 text-content-1 border border-border-1 rounded-small bg-background-1"
								placeholderTextColor="#656886"
							/>
						))}
					</View>

					<View className="items-center">
						<Pressable onPress={handleResend}>
							<Text className="text-paragraph-p3 text-content-4">
								<Trans>没有收到验证码？</Trans>
								<Text className="text-brand-support">
									<Trans>重新发送</Trans>
								</Text>
							</Text>
						</Pressable>
					</View>
				</View>
			</View>

			<SafeAreaView edges={['bottom']}>
				<View className="px-5 py-3xl">
					<Button
						block
						size="lg"
						color="primary"
						disabled={!isCodeComplete}
						onPress={handleConfirm}
					>
						<Text>
							<Trans>确认</Trans>
						</Text>
					</Button>
				</View>
			</SafeAreaView>

			<WithdrawStatusModal
				visible={showSuccessModal}
				status="success"
				onClose={handleCloseSuccessModal}
			/>
		</View>
	);
}
