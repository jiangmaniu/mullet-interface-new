import { useCSSVariable } from 'uniwind';

export function useThemeColors() {
  const [
    textColorContent1,
    textColorContent2,
    textColorContent3,
    textColorContent4,
    
    backgroundColorPrimary,
    backgroundColorSecondary,
    backgroundColorCard,
    
    colorBrandPrimary,
    colorBrandDefault,
    colorBrandSecondary1,
    colorBrandSecondary2,
    colorBrandSecondary3,
    
    colorStatusSuccess,
    colorStatusWarning,
    colorStatusDanger,
    
    colorMarketRise,
    colorMarketFall,
  ] = useCSSVariable([
    '--text-color-content-1',
    '--text-color-content-2',
    '--text-color-content-3',
    '--text-color-content-4',
    
    '--background-color-primary',
    '--background-color-secondary',
    '--background-color-card',
    
    '--color-brand-primary',
    '--color-brand-default',
    '--color-brand-secondary-1',
    '--color-brand-secondary-2',
    '--color-brand-secondary-3',
    
    '--color-status-success',
    '--color-status-warning',
    '--color-status-danger',
    
    '--color-market-rise',
    '--color-market-fall',
  ]) as unknown as string[];

  return {
    textColorContent1,
    textColorContent2,
    textColorContent3,
    textColorContent4,
    
    backgroundColorPrimary,
    backgroundColorSecondary,
    backgroundColorCard,
    
    colorBrandPrimary,
    colorBrandDefault,
    colorBrandSecondary1,
    colorBrandSecondary2,
    colorBrandSecondary3,
    
    colorStatusSuccess,
    colorStatusWarning,
    colorStatusDanger,
    
    colorMarketRise,
    colorMarketFall,
  };
}
