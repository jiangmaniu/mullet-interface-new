import { useResolveClassNames } from 'uniwind';
import {
  Activity,
  Wallet,
  HomeSimple,
  Bell,
  Search,
  XmarkCircleSolid,
  UserCircle,
  NavArrowDown,
  Settings,
  EyeClosed,
  Eye,
  Dollar,
  Copy,
  CoinsSwap,
  PlusCircle,
  NavArrowRight,
  Check,
  WarningCircle,
  Xmark,
} from 'iconoir-react-native';
import { SvgProps } from 'react-native-svg';

function withUniwind(Icon: React.ComponentType<SvgProps>) {
  const WithUniwind = (props: SvgProps & { className?: string }) => {
    const style = useResolveClassNames(props.className || '');
    const { color, width, height } = (style || {}) as any;

    return (
      <Icon
        {...props}
        color={color || props.color}
        width={width || props.width}
        height={height || props.height}
      />
    );
  };

  WithUniwind.displayName = ` Iconify(${Icon.displayName || Icon.name || 'Icon'})`;

  return WithUniwind;
}

export const IconifyActivity = withUniwind(Activity);
export const IconifyWallet = withUniwind(Wallet);
export const IconifyHomeSimple = withUniwind(HomeSimple);
export const IconifyBell = withUniwind(Bell);
export const IconifySearch = withUniwind(Search);
export const IconifyXmarkCircleSolid = withUniwind(XmarkCircleSolid);
export const IconifyUserCircle = withUniwind(UserCircle);
export const IconifyNavArrowDown = withUniwind(NavArrowDown);
export const IconifySettings = withUniwind(Settings);
export const IconifyEyeClosed = withUniwind(EyeClosed);
export const IconifyEye = withUniwind(Eye);
export const IconifyDollar = withUniwind(Dollar);
export const IconifyCopy = withUniwind(Copy);
export const IconifyCoinsSwap = withUniwind(CoinsSwap);
export const IconifyPlusCircle = withUniwind(PlusCircle);
export const IconifyNavArrowRight = withUniwind(NavArrowRight);
export const IconifyCheck = withUniwind(Check);
export const IconifyWarningCircle = withUniwind(WarningCircle);
export const IconifyXmark = withUniwind(Xmark);
