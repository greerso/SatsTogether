// Shared visual tokens for the SatsTogether prototype UI.
// Single source of truth for the card container and palette that every
// component reused verbatim.
export const colors = {
  screen: '#111',
  card: '#1a1a1a',
  accent: '#0f0',
  muted: '#aaa',
  dim: '#666',
} as const;

export const cardStyle = {
  marginVertical: 20,
  padding: 15,
  backgroundColor: colors.card,
  borderRadius: 12,
} as const;
