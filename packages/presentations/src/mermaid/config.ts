import { canonicalJson, sha256 } from '@coursera-notes/core';

export interface MermaidThemeTokens {
  fontFamily: string;
  background: string;
  foreground: string;
  surface: string;
  border: string;
  accent: string;
  mutedBorder: string;
}

export interface MermaidConfigurationResult {
  configuration: Record<string, unknown>;
  configurationSha256: string;
}

export const DEFAULT_MERMAID_THEME: MermaidThemeTokens = {
  fontFamily: 'Segoe UI, Arial, sans-serif',
  background: '#F3F3F3',
  foreground: '#122B4A',
  surface: '#EAF7FA',
  border: '#122B4A',
  accent: '#4CC3D9',
  mutedBorder: '#4CC3D9',
};

export function createMermaidConfiguration(
  theme: MermaidThemeTokens = DEFAULT_MERMAID_THEME,
): MermaidConfigurationResult {
  const configuration: Record<string, unknown> = {
    securityLevel: 'strict',
    theme: 'base',
    htmlLabels: false,
    fontFamily: theme.fontFamily,
    flowchart: {
      curve: 'linear',
      htmlLabels: false,
      nodeSpacing: 48,
      rankSpacing: 58,
      useMaxWidth: true,
    },
    themeVariables: {
      background: theme.background,
      fontFamily: theme.fontFamily,

      primaryColor: theme.surface,
      primaryBorderColor: theme.accent,
      primaryTextColor: theme.foreground,

      secondaryColor: theme.background,
      secondaryBorderColor: theme.border,
      secondaryTextColor: theme.foreground,

      tertiaryColor: theme.background,
      tertiaryBorderColor: theme.mutedBorder,
      tertiaryTextColor: theme.foreground,

      lineColor: theme.foreground,
      textColor: theme.foreground,
      edgeLabelBackground: theme.background,

      clusterBkg: theme.background,
      clusterBorder: theme.mutedBorder,
    },
  };

  return {
    configuration,
    configurationSha256: sha256(canonicalJson(configuration)),
  };
}
