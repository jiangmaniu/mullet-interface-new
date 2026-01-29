import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { NavArrowLeft } from 'iconoir-react-native';
import React from 'react';
import { View } from 'react-native';
import { Text } from './text';

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
  className,
  center = false
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
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 h-10 w-10 rounded-full"
          onPress={handleBack}
        >
          <NavArrowLeft width={24} height={24} className="text-foreground" />
        </Button>
      );
    }
    return null;
  };

  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-xl py-1.5 h-[44px]',
        className
      )}
    >
      <View className="z-10 items-start justify-center">
        {renderLeft()}
      </View>

      {content ? (
        <Text className={cn('text-content-1 text-important-1', { 'justify-center': center })}>
          {content}
        </Text>
      ) : (
        <View className="flex-1" />
      )}

      <View className="z-10 items-end justify-center">
        {right}
      </View>
    </View>
  );
}
