import React from 'react';
import { View } from 'react-native';
import {
  Tabs,
  MaterialTabBar,
  MaterialTabBarProps,
} from 'react-native-collapsible-tab-view';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useResolveClassNames } from 'uniwind';

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const tabBarVariants = cva(
  'w-full flex-row items-center',
  {
    variants: {
      variant: {
        default: '',
        underline: 'border-b border-brand-default', // We handle indicator separately in MaterialTabBar
      },
      size: {
        default: '',
        sm: '',
        md: 'h-10',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const labelVariants = cva(
  'text-content-1 m-0 h-auto',
  {
    variants: {
      variant: {
        default: '',
        underline: '', // We handle indicator separately in MaterialTabBar
      },
      size: {
        default: '',
        sm: '',
        md: 'text-button-2',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const tabVariants = cva(
  '',
  {
    variants: {
      variant: {
        default: '',
        underline: '', // We handle indicator separately in MaterialTabBar
      },
      size: {
        default: '',
        sm: '',
        md: 'p-xl',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

type CollapsibleTabProps = Omit<React.ComponentProps<typeof Tabs.Container>, 'renderTabBar'> &
  VariantProps<typeof tabBarVariants> & {
    tabBarClassName?: string;
    renderTabBarRight?: () => React.ReactNode;
  };

export function CollapsibleTab({
  variant = 'underline',
  size = 'default',
  tabBarClassName,
  renderTabBarRight,
  containerStyle,
  ...props
}: CollapsibleTabProps) {
  const { 
    colorBrandPrimary, 
    textColorContent1, 
    textColorContent4,
  } = useThemeColors();

  const labelStyle = useResolveClassNames(labelVariants({ variant, size }))
  const tabStyle = useResolveClassNames(tabVariants({ variant, size }))
  
  // Custom TabBar to match our design system
  const renderTabBar = (tabBarProps: MaterialTabBarProps<any>) => {
    return (
      <View className={cn(tabBarVariants({ variant, size }), "px-xl", tabBarClassName)}>
        {/* <View className="w-full h-full flex-row bg-secondary"> */}
          <MaterialTabBar
            {...tabBarProps}
            scrollEnabled
            style={{ height: '100%' }}
            contentContainerStyle={{ alignItems: 'center' }}
            indicatorStyle={{ backgroundColor: colorBrandPrimary, height: 2, bottom: 0 }}
            labelStyle={labelStyle}
            activeColor={textColorContent1}
            inactiveColor={textColorContent4}
            tabStyle={tabStyle}
          />
          {renderTabBarRight && (
              <View className='flex-shrink-0'>
                  {renderTabBarRight()}
              </View>
          )}
        {/* </View> */}
      </View >
    );
  };

  const headerContainerStyle = useResolveClassNames('shadow-none elevation-0 bg-secondary')
  return (
    <Tabs.Container
      renderTabBar={renderTabBar}
      containerStyle={containerStyle}
      headerContainerStyle={headerContainerStyle}
      {...props}
    >
      {props.children}
    </Tabs.Container>
  );
}

// Export sub-components for direct usage
export const CollapsibleTabScene = Tabs.Tab;
export const CollapsibleFlatList = Tabs.FlatList;
export const CollapsibleScrollView = Tabs.ScrollView;
export const CollapsibleSectionList = Tabs.SectionList;
