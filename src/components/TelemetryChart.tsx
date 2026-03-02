import React from 'react';

const TelemetryChart = ({
  data,
  label,
  color,
}: {
  data: number[];
  label: string;
  color: string;
}) => (
  <div className="mini-chart">
    <div className="chart-label">{label}</div>
    <div className="chart-bars">
      {data.map((v, i) => (
        /* Inline style required for CSS custom properties */
        <div
          key={i}
          className="bar"
          style={
            {
              '--bar-height': `${Math.min(100, v)}%`,
              '--bar-color': color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  </div>
);

export default TelemetryChart;
