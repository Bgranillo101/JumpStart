import { useEffect, useState } from 'react';

const COLORS = ['#ffdd00', '#f2ae00', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#e4e1dd'];

interface Piece {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
}

export function Confetti({ duration = 3000 }: { duration?: number }) {
  const [pieces, setPieces] = useState<Piece[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 6,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => setPieces([]), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
