// Teaching diagrams share a compact flowchart layout so their labels remain
// readable after the SVG is fitted into the native presentation slide.
export function teachingMermaidConfiguration(configuration) {
  return {
    ...configuration,
    flowchart: {
      ...configuration.flowchart,
      nodeSpacing: 20,
      rankSpacing: 28,
    },
  };
}
