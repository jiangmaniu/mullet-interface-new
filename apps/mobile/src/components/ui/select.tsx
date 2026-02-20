import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { IconifyNavArrowDown } from '@/components/ui/icons/iconify';
import { InputContainer, type InputContainerProps } from '@/components/ui/input-container';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

type Option = { value: string; label: string };

/* ─── Context ─── */
interface SelectContextValue {
  value: Option | undefined;
  onValueChange: (option: Option) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  value: undefined,
  onValueChange: () => { },
  open: false,
  setOpen: () => { },
});

function useSelectContext() {
  return React.useContext(SelectContext);
}

/* ─── Select (Root) ─── */
interface SelectProps {
  value?: Option;
  onValueChange?: (option: Option) => void;
  children: React.ReactNode;
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  const ctx = React.useMemo<SelectContextValue>(
    () => ({
      value,
      onValueChange: (option) => {
        onValueChange?.(option);
        setOpen(false);
      },
      open,
      setOpen,
    }),
    [value, onValueChange, open]
  );

  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
}

/* ─── SelectTrigger ─── */
type SelectTriggerProps = Omit<InputContainerProps, 'children' | 'value' | 'clean'> & {
  children?: React.ReactNode;
};

function SelectTrigger({ children, className, ...containerProps }: SelectTriggerProps) {
  const { value, setOpen } = useSelectContext();

  return (
    <Pressable onPress={() => setOpen(true)}>
      <View pointerEvents="none">
        <InputContainer
          variant="outlined"
          size="md"
          value={value?.label}
          clean={false}
          RightContent={<IconifyNavArrowDown width={16} height={16} className="text-content-1" />}
          className={cn(className)}
          {...containerProps}
        >
          <View className="flex-1">
            {children}
          </View>
        </InputContainer>
      </View>
    </Pressable>
  );
}

/* ─── SelectValue (optional, for custom trigger content) ─── */
function SelectValue({ placeholder, className }: { placeholder?: string; className?: string }) {
  const { value } = useSelectContext();
  return (
    <Text className={cn('text-paragraph-p2', value ? 'text-content-1' : 'text-content-4', className)}>
      {value?.label ?? placeholder}
    </Text>
  );
}

/* ─── SelectContent ─── */
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  height?: number;
}

function SelectContent({ children, className, height = 204 }: SelectContentProps) {
  const { open, setOpen } = useSelectContext();

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className={cn('py-3xl', className)} style={{ height }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </DrawerContent>
    </Drawer>
  );
}

/* ─── SelectItem ─── */
interface SelectItemProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function SelectItem({ value: itemValue, label, icon, className, disabled }: SelectItemProps) {
  const { value, onValueChange } = useSelectContext();
  const isSelected = value?.value === itemValue;

  return (
    <Pressable
      onPress={() => !disabled && onValueChange({ value: itemValue, label })}
      className={cn('flex-row items-center', disabled && 'opacity-50', className)}
      disabled={disabled}
    >
      {icon && <View className="mr-medium">{icon}</View>}
      <Text className="flex-1 text-paragraph-p2 text-content-1">{label}</Text>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => !disabled && onValueChange({ value: itemValue, label })}
      />
    </Pressable>
  );
}

/* ─── SelectSeparator ─── */
function SelectSeparator({ className }: { className?: string }) {
  return <View className={cn('bg-brand-divider-line my-xs h-px', className)} />;
}

export {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
};
