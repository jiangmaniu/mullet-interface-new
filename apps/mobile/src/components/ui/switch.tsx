import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';
import { Platform } from 'react-native';

function Switch({
  className,
  ...props
}: SwitchPrimitives.RootProps & React.RefAttributes<SwitchPrimitives.RootRef>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer flex h-[18px] w-[30px] shrink-0 cursor-pointer flex-row items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        Platform.select({
          web: 'focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        props.checked ? 'bg-brand-primary' : 'bg-zinc-300/20',
        className
      )}
      {...props}>
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block size-[10px] rounded-full shadow-lg ring-0 transition-transform',
          props.checked
            ? 'bg-black translate-x-[16px]'
            : 'bg-zinc-300 translate-x-[2px]'
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
