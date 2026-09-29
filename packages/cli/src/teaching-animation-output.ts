const OUTPUT_MARKER = /^ANIMATION_OUTPUT_FILE=(.+)\r?$/gmu;
const OUTPUT_FILE = /^session-animated(?:-review-[a-f0-9]{32})?\.pptx$/u;

export function animatedOutputFile(stdout: string, requireMarker = false): string {
  const matches = [...stdout.matchAll(OUTPUT_MARKER)];
  if (matches.length === 0) {
    if (requireMarker) throw new Error('PowerPoint did not report its animated PPTX output file.');
    return 'session-animated.pptx';
  }
  if (matches.length !== 1 || !matches[0]?.[1] || !OUTPUT_FILE.test(matches[0][1])) {
    throw new Error('PowerPoint reported an invalid animated PPTX output file.');
  }
  return matches[0][1];
}
