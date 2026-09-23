import { canonicalJson, sha256 } from '@coursera-notes/core';

export interface NativePptxTheme {
  schemaVersion: 1;
  id: string;
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  brand: {
    name: string;
    footerText: string;
    logoPath: string;
    symbolPath: string;
  };
  colors: {
    canvas: string;
    ink: string;
    muted: string;
    surface: string;
    border: string;
    accent: string;
    inverse: string;
  };
}

export const DEFAULT_NATIVE_PPTX_THEME: NativePptxTheme = {
  schemaVersion: 1,
  id: 'kraak-consulting-native-v1',
  fonts: {
    heading: 'Segoe UI',
    body: 'Segoe UI',
    mono: 'Consolas',
  },
  brand: {
    name: 'KRAAK Consulting',
    footerText: 'KRAAK CONSULTING',
    logoPath: 'packages/presentations/assets/brand/kraak/kraak-logo.png',
    symbolPath: 'packages/presentations/assets/brand/kraak/kraak-symbol.png',
  },
  colors: {
    canvas: 'F3F3F3',
    ink: '122B4A',
    muted: '122B4A',
    surface: 'F4FBFD',
    border: '4CC3D9',
    accent: '1673AE',
    inverse: 'FFFFFF',
  },
};

export function serializeNativePptxTheme(theme: NativePptxTheme): string {
  return canonicalJson(theme);
}

export function nativePptxThemeSha256(theme: NativePptxTheme): string {
  return sha256(serializeNativePptxTheme(theme));
}
