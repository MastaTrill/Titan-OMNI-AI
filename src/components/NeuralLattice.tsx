import React, { useEffect, useRef } from 'react';

const NeuralLattice = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points = Array.from({ length: 30 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 300,
      vx: Math.random() - 0.5,
      vy: Math.random() - 0.5,
    }));

    const frame = () => {
      ctx.clearRect(0, 0, 300, 300);
      points.forEach((p, i) => {
        p.x = (p.x + p.vx + 300) % 300;
        p.y = (p.y + p.vy + 300) % 300;
        points.forEach((p2, j) => {
          if (i === j) return;
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 50) {
            ctx.strokeStyle = `rgba(0, 229, 255, ${active ? 0.3 : 0.05})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(frame);
    };
    const req = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(req);
  }, [active]);

  return (
    <canvas ref={canvasRef} width={300} height={300} className="lattice-bg" />
  );
};

export default NeuralLattice;
