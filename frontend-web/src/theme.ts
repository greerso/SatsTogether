// Palette + type tokens for the SatsTogether Flow, lifted from the design canvas.
// Screens keep the design's literal hex inline for pixel fidelity; these tokens
// are for shared chrome (frames, canvas) and anyone extending the flow.
export const colors = {
  canvas: '#EFE7DA', // page background behind the device frames
  screen: '#FBF5EC', // light app screen background
  ink: '#1E1810', // primary text
  muted: '#6B5D4C', // secondary text
  faint: '#9A8B76', // labels / tertiary text
  // Bitcoin orange ramp
  orange: '#F7931A',
  orangeDeep: '#E8620A',
  orangeAccent: '#EE6B12',
  orangeLight: '#FFB443',
  // No-loss teal
  teal: '#0E9E8E',
  tealDeep: '#0B7F72',
  // Alert
  red: '#F4552E',
} as const;

export const fonts = {
  display: "'Bricolage Grotesque', 'Instrument Sans', sans-serif",
  body: "'Instrument Sans', system-ui, sans-serif",
} as const;
