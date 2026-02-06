import { IconButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { NavArrowLeft } from 'iconoir-react-native';
import React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ScreenHeaderProps {
  content?: string | React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  center?: boolean
}

export function ScreenHeader({
  content,
  left,
  right,
  showBackButton = true,
  onBack,
  center,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const renderLeft = () => {
    if (left) return left;
    if (showBackButton && router.canGoBack()) {
      return (
        <IconButton
          variant="icon"
          className="-ml-2 h-10 w-10 rounded-full"
          onPress={handleBack}
        >
          <NavArrowLeft width={24} height={24} className="text-foreground" />
        </IconButton>
      );
    }
    return null;
  };

  const hasLeft = !!left || (showBackButton && router.canGoBack());

  return (
    <SafeAreaView edges={['top']}>
      <View
        className={cn(
          'relative flex-row items-center justify-between px-xl py-1.5 h-[44px]',
          className
        )}
      >
        <View className="z-10 items-start justify-center">
          {renderLeft()}
        </View>

        {content && (
          <View
            className={cn(
              'absolute left-0 right-0 top-0 bottom-0 justify-center pointer-events-none px-xl',
              (hasLeft || center) && 'items-center'
            )}
          >
            <Text className={cn('text-content-1 text-important-1')}>
              {content}
            </Text>
          </View>
        )}

        <View className="z-10 items-end justify-center">
          {right}
        </View>
      </View>

    </SafeAreaView>
  );
}
