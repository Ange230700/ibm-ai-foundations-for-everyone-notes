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
  fontFamily: 'Inter, Arial, sans-serif',
  background: '#FFFFFF',
  foreground: '#111111',
  surface: '#F5F5F5',
  border: '#666666',
  accent: '#333333',
  mutedBorder: '#D4D4D4',
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
