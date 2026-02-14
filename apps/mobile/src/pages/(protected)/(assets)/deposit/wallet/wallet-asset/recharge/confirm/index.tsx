import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconifyNavArrowRight } from '@/components/ui/icons/iconify';
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle';
import { IconSpecialFail } from '@/components/ui/icons/set/special/fail';
import { IconSpecialSuccess } from '@/components/ui/icons/set/special/success';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { IconMetamaskFull } from '@/components/ui/icons/set/wallet/metamask-full';
import { ScreenHeader } from '@/components/ui/screen-header';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Trans } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrderStatus = 'idle' | 'processing' | 'success' | 'failed';

const MOCK_AMOUNT = '75,000.00';
const MOCK_SOURCE = 'MetaMask（0x862D...B22A）';
const MOCK_TARGET = '1523658521';
const COUNTDOWN_SECONDS = 30;

export default function ConfirmOrderScreen() {
	const [status, setStatus] = useState<OrderStatus>('idle');
	const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
	const timerRef = useRef<ReturnType<typeof setInterval>>(null);

	const startProcessing = useCallback(() => {
		setStatus('processing');
		setCountdown(COUNTDOWN_SECONDS);
		timerRef.current = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current!);
					// Mock: randomly succeed or fail
					setStatus(Math.random() > 0.3 ? 'success' : 'failed');
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, []);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	const isResult = status === 'success' || status === 'failed';

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader
				content={<Trans>订单确认</Trans>}
				right={
					status === 'processing' ? (
						<Text className="text-important-1 text-status-warning">{countdown}S</Text>
					) : undefined
				}
			/>

			<View className={cn("gap-xl", ['idle', 'processing'].includes(status) ? 'flex-1' : '')}>
				{/* 结果状态图标 */}
				{isResult && (
					<View className="items-center gap-large py-xl">
						{status === 'success' ? (
							<IconSpecialSuccess width={50} height={50} />
						) : (
							<IconSpecialFail width={50} height={50} />
						)}
						<Text className="text-paragraph-p2 text-content-1">
							{status === 'success' ? (
								<Trans>您的资金已成功存入</Trans>
							) : (
								<Trans>您的资金存入失败</Trans>
							)}
						</Text>
					</View>
				)}

				{/* 金额 - 仅在非结果状态显示 */}
				{!isResult && (
					<View className="flex-row items-center justify-center gap-xs py-2xl">
						<Text className="text-title-h2 text-content-1">$</Text>
						<Text className="text-title-h2 text-content-1">{MOCK_AMOUNT}</Text>
					</View>
				)}

				{/* 订单详情 */}
				<View className="px-5 gap-medium">
					{/* 来源 */}
					<DetailRow
						label={<Trans>来源</Trans>}
						value={
							<Pressable className="flex-row items-center gap-medium">
								<IconMetamaskFull width={24} height={24} />
								<Text className="text-paragraph-p2 text-content-1">{MOCK_SOURCE}</Text>
								<IconifyNavArrowRight width={12} height={12} className="text-brand-secondary-3" />
							</Pressable>
						}
					/>

					{/* 目标地址 */}
					<DetailRow
						label={<Trans>目标地址</Trans>}
						value={
							<Pressable className="flex-row items-center gap-medium">
								<IconAppLogoCircle width={24} height={24} />
								<Text className="text-paragraph-p2 text-content-1">{MOCK_TARGET}</Text>
								<IconifyNavArrowRight width={12} height={12} className="text-brand-secondary-3" />
							</Pressable>
						}
					/>

					{/* 预计时间 / 状态 */}
					{isResult ? (
						<DetailRow
							label={<Trans>状态</Trans>}
							value={
								<Text className={`text-paragraph-p2 ${status === 'success' ? 'text-status-success' : 'text-status-danger'}`}>
									{status === 'success' ? <Trans>成功</Trans> : <Trans>失败</Trans>}
								</Text>
							}
						/>
					) : (
						<DetailRow
							label={<Trans>预计时间</Trans>}
							value={<Text className="text-paragraph-p2 text-content-1">＜ 1分钟</Text>}
						/>
					)}

					{/* 总用时 - 仅结果状态 */}
					{isResult && (
						<DetailRow
							label={<Trans>总用时</Trans>}
							value={<Text className="text-paragraph-p2 text-content-1">8秒</Text>}
						/>
					)}

					{/* 您将发送 / 您收到 */}
					{!isResult && (
						<DetailRow
							label={<Trans>您将发送</Trans>}
							value={
								<View className="flex-row items-center gap-medium">
									<IconUSDC1 width={24} height={24} />
									<Text className="text-paragraph-p2 text-content-1">{MOCK_AMOUNT} USDC</Text>
								</View>
							}
						/>
					)}
					<DetailRow
						label={isResult ? <Trans>您收到</Trans> : <Trans>您将收到</Trans>}
						value={
							<View className="flex-row items-center gap-medium">
								<IconUSDC1 width={24} height={24} />
								<Text className="text-paragraph-p2 text-content-1">{MOCK_AMOUNT} USDC</Text>
							</View>
						}
					/>
				</View>

				{/* 费用明细 */}
				<View className="px-5">
					<Card>
						<CardContent className="py-medium gap-large">
							<FeeRow label={<Trans>网络费用</Trans>} value="0.00 USDC" />
							<FeeRow label={<Trans>价格影响</Trans>} value="0.00%" />
							<FeeRow label={<Trans>预估滑点</Trans>} value="自动 0.00%" />
						</CardContent>
					</Card>
				</View>
			</View>

			{/* 底部操作区 */}
			<SafeAreaView edges={['bottom']}>
				<View className="px-5 py-6 gap-xl">
					{['idle', 'processing'].includes(status) && (
						<Text className="text-button-1 text-content-4 text-center">
							<Trans>点击确认订单，即表示您同意</Trans>
							<Text className="text-button-1 underline text-content-1"><Trans>我们的条款</Trans></Text>
						</Text>
					)}

					{status === 'idle' && (
						<Button block size="lg" color="primary" onPress={startProcessing}>
							<Text><Trans>确定订单</Trans></Text>
						</Button>
					)}

					{status === 'processing' && (
						<Button block size="lg" color="primary" loading disabled>
							<Text><Trans>资产兑换中</Trans></Text>
						</Button>

					)}

					{status === 'success' && (
						<>
							<Button block size="lg" color="primary" onPress={() => setStatus('idle')}>
								<Text><Trans>继续入金</Trans></Text>
							</Button>
							<Button block size="lg" color="default">
								<Text><Trans>查看资产</Trans></Text>
							</Button>
						</>
					)}

					{status === 'failed' && (
						<Button block size="lg" color="primary" onPress={() => setStatus('idle')}>
							<Text><Trans>重新入金</Trans></Text>
						</Button>
					)}
				</View>
			</SafeAreaView>
		</View>
	);
}

function DetailRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
	return (
		<View className="flex-row items-center justify-between h-6">
			<Text className="text-paragraph-p2 text-content-4">{label}</Text>
			{value}
		</View>
	);
}

function FeeRow({ label, value }: { label: React.ReactNode; value: string }) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-paragraph-p3 text-content-4" style={{ textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}>
				{label}
			</Text>
			<Text className="text-paragraph-p3 text-content-1">{value}</Text>
		</View>
	);
}
