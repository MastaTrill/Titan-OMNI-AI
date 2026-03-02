import React from 'react';

const GlassPanel = ({ title, children, className = '', extraHeader }: any) => (
  <div className={`omni-glass ${className}`}>
    <div className="glass-head">
      <div className="orb" />
      <span className="label">{title}</span>
      {extraHeader}
    </div>
    <div className="glass-content">{children}</div>
    <div className="trim tl" />
    <div className="trim tr" />
    <div className="trim bl" />
    <div className="trim br" />
  </div>
);

export default GlassPanel;
