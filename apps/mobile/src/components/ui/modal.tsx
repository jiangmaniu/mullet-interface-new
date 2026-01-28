import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import {
	Modal as RNModal,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	type ModalProps as RNModalProps,
	type ViewProps,
} from 'react-native';
import { IconifyXmark } from './icons';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { IconButton } from './button';

const ModalContext = React.createContext<{
	onClose?: () => void;
}>({});

interface ModalProps extends RNModalProps {
	/**
	 * 是否显示遮罩层
	 * @default true
	 */
	hasBackdrop?: boolean;
	/**
	 * 点击遮罩层是否关闭
	 * @default true
	 */
	closeOnBackdropPress?: boolean;
	/**
	 * 关闭回调
	 */
	onClose?: () => void;
	className?: string;
}

/**
 * 基础模态框组件 (Modal)
 *
 * 封装了 React Native Modal，提供了遮罩层点击关闭等功能。
 */
function Modal({
	className,
	transparent = true,
	animationType = 'fade',
	hasBackdrop = true,
	closeOnBackdropPress = true,
	onClose,
	children,
	...props
}: ModalProps) {
	return (
		<ModalContext.Provider value={{ onClose }}>
			<RNModal
				transparent={transparent}
				animationType={animationType}
				statusBarTranslucent
				onRequestClose={onClose}
				{...props}
			>
				<TouchableWithoutFeedback onPress={closeOnBackdropPress ? onClose : undefined}>
					<View
						className={cn(
							'flex-1 justify-center items-center',
							hasBackdrop && 'bg-black/80',
							className
						)}
					>
						<TouchableWithoutFeedback>
							{/* 这里必须要用 View 包裹 children，否则点击内容区域也会触发 onClose */}
							<View className="w-[281px] shrink-0 flex items-center justify-center p-2xl pointer-events-box-none bg-special rounded-large border border-brand-default">
								{children}
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</RNModal>
		</ModalContext.Provider>
	);
}

const ModalContent = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
	({ className, children, ...props }, ref) => (
		<View
			ref={ref}
			className={cn(
				'py-3xl',
				className
			)}
			{...props}
		>
			{children}
		</View>
	)
);
ModalContent.displayName = 'ModalContent';

const ModalHeader = React.forwardRef<React.ElementRef<typeof View>, ViewProps & { showClose?: boolean }>(
	({ className, children, showClose = true, ...props }, ref) => (
		<View
			ref={ref}
			className={cn('w-full flex-row items-center justify-between', className)}
			{...props}
		>
			{children}
			{showClose && <ModalClose />}
		</View>
	)
);
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = React.forwardRef<
	React.ElementRef<typeof Text>,
	React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
	<Text
		ref={ref}
		className={cn('text-important-1 text-content-1', className)}
		{...props}
	/>
));
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = React.forwardRef<
	React.ElementRef<typeof Text>,
	React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
	<Text
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
));
ModalDescription.displayName = 'ModalDescription';

const ModalFooter = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
	({ className, ...props }, ref) => (
		<View
			ref={ref}
			className={cn('flex-row justify-end gap-4 w-full', className)}
			{...props}
		/>
	)
);
ModalFooter.displayName = 'ModalFooter';

/**
 * 模态框关闭按钮
 * 默认使用 X 图标，放置在 Header 右侧
 */
const ModalClose = React.forwardRef<
	React.ElementRef<typeof TouchableOpacity>,
	React.ComponentPropsWithoutRef<typeof TouchableOpacity>
>(({ className, onPress, ...props }, ref) => {
	const { onClose } = React.useContext(ModalContext);
	const { colorBrandSecondary3 } = useThemeColors()
	return (
		<IconButton
			variant="none"
			onPress={onClose}
		>
			<IconifyXmark width={24} height={24} color={colorBrandSecondary3} />
		</IconButton>
	);
});
ModalClose.displayName = 'ModalClose';

export {
	Modal,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
};
