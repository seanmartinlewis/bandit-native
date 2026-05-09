import { useColorScheme } from 'react-native';

export const banditColors = {
  primary: '#2563eb',
  primaryStrong: '#1d4ed8',
  primaryDisabled: '#60a5fa',
  primaryDark: '#475569',
  primarySoft: '#64748b',
};

const tintColorLight = banditColors.primary;
const tintColorDark = banditColors.primarySoft;

export function useBrandTint(): string {
  const scheme = useColorScheme();
  return scheme === 'dark' ? banditColors.primarySoft : banditColors.primary;
}

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
