import { canonicalJson, sha256 } from '@coursera-notes/core';

export interface NativePptxTheme {
  schemaVersion: 1;
  id: string;
  fonts: {
    heading: string;
    body: string;
    mono: string;
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
  id: 'default-native-v1',
  fonts: {
    heading: 'Arial',
    body: 'Arial',
    mono: 'Consolas',
  },
  colors: {
    canvas: 'FFFFFF',
    ink: '111111',
    muted: '5F6368',
    surface: 'F5F5F5',
    border: 'D4D4D4',
    accent: '333333',
    inverse: 'FFFFFF',
  },
};

export function serializeNativePptxTheme(theme: NativePptxTheme): string {
  return canonicalJson(theme);
}

export function nativePptxThemeSha256(theme: NativePptxTheme): string {
  return sha256(serializeNativePptxTheme(theme));
}
