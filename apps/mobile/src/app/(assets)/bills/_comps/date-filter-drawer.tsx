import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
} from '@/components/ui/drawer';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { i18n, t } from '@/locales/i18n';
import { Trans } from '@lingui/react/macro';
import DateTimePicker, {
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

export interface DateRange {
	startDate: Date | null;
	endDate: Date | null;
}

interface DateFilterDrawerProps {
	visible: boolean;
	onClose: () => void;
	dateRange: DateRange;
	onApply: (range: DateRange) => void;
}

interface QuickOption {
	label: string;
	days: number;
}

const QUICK_OPTIONS: QuickOption[] = [
	{ label: '近7天', days: 7 },
	{ label: '近30天', days: 30 },
	{ label: '近90天', days: 90 },
	{ label: '近1年', days: 365 },
];

// 将 i18n locale 转换为 DateTimePicker 支持的格式
const getDatePickerLocale = () => {
	const locale = i18n.locale;
	const localeMap: Record<string, string> = {
		'zh-cn': 'zh-Hans',
		'zh-tw': 'zh-Hant',
		'zh-hk': 'zh-Hant-HK',
		en: 'en-US',
	};
	return localeMap[locale] || 'zh-Hans';
};

// 获取 toLocaleDateString 的 locale
const getFormatLocale = () => {
	const locale = i18n.locale;
	const localeMap: Record<string, string> = {
		'zh-cn': 'zh-CN',
		'zh-tw': 'zh-TW',
		'zh-hk': 'zh-HK',
		en: 'en-US',
	};
	return localeMap[locale] || 'zh-CN';
};

export function DateFilterDrawer({
	visible,
	onClose,
	dateRange,
	onApply,
}: DateFilterDrawerProps) {
	const { colorBrandPrimary } = useThemeColors();
	const [startDate, setStartDate] = useState<Date | null>(dateRange.startDate);
	const [endDate, setEndDate] = useState<Date | null>(dateRange.endDate);
	const [selectedQuickOption, setSelectedQuickOption] = useState<number | null>(
		null
	);

	// 当前激活的字段，同时只显示一个选择器
	const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);

	// 确定按钮是否可用（两个日期都选择后才能点击）
	const isApplyEnabled = startDate !== null && endDate !== null;

	const handleQuickOptionPress = (option: QuickOption, index: number) => {
		const end = new Date();
		const start = new Date();
		start.setDate(start.getDate() - option.days);

		setStartDate(start);
		setEndDate(end);
		setSelectedQuickOption(index);
		setActiveField(null);
	};

	const handleDateChange = (
		_event: DateTimePickerEvent,
		selectedDate?: Date
	) => {
		if (Platform.OS === 'android') {
			setActiveField(null);
		}
		if (selectedDate) {
			if (activeField === 'start') {
				setStartDate(selectedDate);
			} else if (activeField === 'end') {
				setEndDate(selectedDate);
			}
			setSelectedQuickOption(null);
		}
	};

	const handleFieldPress = (field: 'start' | 'end') => {
		// 直接切换到点击的字段，不做toggle
		setActiveField(field);
	};

	const handleApply = () => {
		if (isApplyEnabled) {
			onApply({ startDate, endDate });
			onClose();
		}
	};

	const handleReset = () => {
		setStartDate(null);
		setEndDate(null);
		setSelectedQuickOption(null);
		setActiveField(null);
	};

	const formatDate = (date: Date | null) => {
		if (!date) return t`请选择`;
		return date.toLocaleDateString(getFormatLocale(), {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
	};

	const getPickerValue = () => {
		if (activeField === 'start') {
			// 优先使用已选的开始时间，否则使用结束时间或今天
			return startDate || endDate || new Date();
		}
		// 优先使用已选的结束时间，否则使用开始时间或今天
		return endDate || startDate || new Date();
	};

	const getMaxDate = () => {
		if (activeField === 'start') {
			return endDate || new Date();
		}
		return new Date();
	};

	const getMinDate = () => {
		if (activeField === 'end' && startDate) {
			return startDate;
		}
		return undefined;
	};

	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent>
				<View className="p-3xl gap-medium">
					{/* Quick Options */}
					<View className="gap-medium">
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>快速选择</Trans>
						</Text>
						<View className="flex-row flex-wrap gap-small">
							{QUICK_OPTIONS.map((option, index) => (
								<TouchableOpacity
									key={index}
									className={`px-large py-small rounded-small ${selectedQuickOption === index
										? 'bg-brand-primary'
										: 'bg-button'
										}`}
									onPress={() => handleQuickOptionPress(option, index)}
								>
									<Text
										className={`text-paragraph-p3 ${selectedQuickOption === index
											? 'text-content-foreground'
											: 'text-content-1'
											}`}
									>
										{option.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Date Range Selection */}
					<View className="gap-medium">
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>时间范围</Trans>
						</Text>

						<View className="flex-row items-center gap-medium">
							{/* Start Date */}
							<TouchableOpacity
								className={`flex-1 rounded-small py-medium px-large ${activeField === 'start'
									? 'bg-brand-primary/10 border border-brand-primary'
									: 'bg-button'
									}`}
								onPress={() => handleFieldPress('start')}
							>
								<Text className="text-paragraph-p2 text-content-1 text-center">
									{formatDate(startDate)}
								</Text>
							</TouchableOpacity>

							<Text className="text-paragraph-p3 text-content-4">
								<Trans>至</Trans>
							</Text>

							{/* End Date */}
							<TouchableOpacity
								className={`flex-1 rounded-small py-medium px-large ${activeField === 'end'
									? 'bg-brand-primary/10 border border-brand-primary'
									: 'bg-button'
									}`}
								onPress={() => handleFieldPress('end')}
							>
								<Text className="text-paragraph-p2 text-content-1 text-center">
									{formatDate(endDate)}
								</Text>
							</TouchableOpacity>
						</View>
					</View>

					{/* iOS Inline Date Picker - 只显示一个 */}
					{Platform.OS === 'ios' && activeField && (
						<View className="bg-button rounded-small p-medium items-center">
							<DateTimePicker
								value={getPickerValue()}
								mode="date"
								display="spinner"
								onChange={handleDateChange}
								maximumDate={getMaxDate()}
								minimumDate={getMinDate()}
								locale={getDatePickerLocale()}
								accentColor={colorBrandPrimary}
							/>
						</View>
					)}

					{/* Android Date Picker Modal - 只显示一个 */}
					{Platform.OS === 'android' && activeField && (
						<DateTimePicker
							key={activeField}
							value={getPickerValue()}
							mode="date"
							display="default"
							onChange={handleDateChange}
							maximumDate={getMaxDate()}
							minimumDate={getMinDate()}
							accentColor={colorBrandPrimary}
						/>
					)}
				</View>

				{/* Action Buttons */}
				<DrawerFooter>
					<Button
						variant="secondary"
						className="flex-1"
						size="lg"
						onPress={handleReset}
					>
						<Text>
							<Trans>重置</Trans>
						</Text>
					</Button>
					<Button
						color="primary"
						variant="primary"
						className="flex-1"
						size="lg"
						onPress={handleApply}
						disabled={!isApplyEnabled}
					>
						<Text>
							<Trans>确定</Trans>
						</Text>
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
