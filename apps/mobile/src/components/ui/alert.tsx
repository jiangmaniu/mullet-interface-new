import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { IconifyChatBubbleWarning } from './icons';

const alertVariants = cva(
	'flex-row items-start rounded-small p-2xl gap-medium border',
	{
		variants: {
			variant: {
				warning: 'bg-status-warning/10 border-status-warning',
				danger: 'bg-status-danger/10 border-status-danger',
				success: 'bg-status-success/10 border-status-success',
				info: 'bg-brand-support/10 border-brand-support',
			},
		},
		defaultVariants: {
			variant: 'warning',
		},
	}
);

const iconColorMap = {
	warning: 'text-status-warning',
	danger: 'text-status-danger',
	success: 'text-status-success',
	info: 'text-brand-support',
} as const;

interface AlertProps extends ViewProps, VariantProps<typeof alertVariants> {
	icon?: React.ReactNode;
}

function Alert({ className, variant = 'warning', children, ...props }: AlertProps) {
	return (
		<View className={cn(alertVariants({ variant }), className)} {...props}>
			<View className='shrink-0'>
				<IconifyChatBubbleWarning width={16} height={16} className={iconColorMap[variant!]} />
			</View>
			<View className="flex-1">{children}</View>
		</View>
	);
}

function AlertText({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			className={cn('text-paragraph-p3 text-content-1', className)}
			{...props}
		/>
	);
}

export { Alert, AlertText };
