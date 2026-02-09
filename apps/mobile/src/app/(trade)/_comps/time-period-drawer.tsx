import { View, Dimensions } from 'react-native'
import { Text } from '@/components/ui/text'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Trans } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'

// All time periods including those shown in dropdown
const ALL_TIME_PERIODS = [
  { label: '1分', value: '1' },
  { label: '3分', value: '3' },
  { label: '5分', value: '5' },
  { label: '15分', value: '15' },
  { label: '30分', value: '30' },
  { label: '1时', value: '60' },
  { label: '2时', value: '120' },
  { label: '4时', value: '240' },
  { label: '6时', value: '360' },
  { label: '12时', value: '720' },
  { label: '1日', value: 'D' },
  { label: '2日', value: '2D' },
  { label: '3日', value: '3D' },
  { label: '5日', value: '5D' },
  { label: '1周', value: 'W' },
  { label: '1月', value: 'M' },
  { label: '3月', value: '3M' },
  { label: '1年', value: 'Y' },
]

const PADDING_HORIZONTAL = 20 // px-5
const GAP = 12 // gap-xl
const COLUMNS = 4

// Calculate button width: (screen width - horizontal padding * 2 - gaps * 3) / 4
const screenWidth = Dimensions.get('window').width
const buttonWidth = (screenWidth - PADDING_HORIZONTAL * 2 - GAP * (COLUMNS - 1)) / COLUMNS

interface TimePeriodDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPeriod: string
  onSelectPeriod: (value: string) => void
}

export function TimePeriodDrawer({
  open,
  onOpenChange,
  selectedPeriod,
  onSelectPeriod,
}: TimePeriodDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='gap-xl'>
        <DrawerHeader className="px-5 pt-3xl">
          <DrawerTitle>
            <Trans>全部周期</Trans>
          </DrawerTitle>
        </DrawerHeader>
        <View className="gap-xl px-5 pb-6">
          {[0, 1, 2, 3, 4].map((rowIndex) => {
            const rowItems = ALL_TIME_PERIODS.slice(rowIndex * 4, rowIndex * 4 + 4)
            return (
              <View key={rowIndex} className="flex-row gap-xl">
                {rowItems.map((period) => (
                  <Button
                    key={period.value}
                    variant='outline'
                    size="sm"
                    style={{ width: buttonWidth }}
                    onPress={() => onSelectPeriod(period.value)}
                  >
                    <Text><Trans>{period.label}</Trans></Text>
                  </Button>
                ))}
              </View>
            )
          })}
        </View>
      </DrawerContent>
    </Drawer>
  )
}
