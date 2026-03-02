import React from 'react';

const SpectralReactor = ({
  active,
  intensity,
  accent,
}: {
  active: boolean;
  intensity: number;
  accent: string;
}) => (
  /* Inline style required for dynamic reactor theming via CSS custom properties */
  <div
    className="spectral-reactor"
    style={
      {
        '--reactor-accent': accent,
        '--reactor-scale': 0.8 + intensity * 0.4,
        '--reactor-glow': `${20 * intensity}px`,
      } as React.CSSProperties
    }
  >
    <div className="reactor-ring" />
    <div className={`reactor-core ${active ? 'active' : ''}`} />
  </div>
);

export default SpectralReactor;
