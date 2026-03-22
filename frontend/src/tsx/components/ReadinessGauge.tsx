import { useEffect, useState } from 'react';

interface ReadinessGaugeProps {
  score: number;
}

export function ReadinessGauge({ score }: ReadinessGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [offset, setOffset] = useState(circumference());

  const radius = 60;
  const stroke = 8;
  const size = (radius + stroke) * 2;

  function circumference() {
    return 2 * Math.PI * 60;
  }

  const circ = circumference();
  const targetOffset = circ * (1 - score / 100);

  const color = score < 50 ? '#ef4444' : score < 75 ? '#eab308' : '#22c55e';
  const label = score < 50 ? 'Needs Work' : score < 75 ? 'Getting There' : 'Strong';

  useEffect(() => {
    // Animate the gauge arc
    const timer = setTimeout(() => setOffset(targetOffset), 50);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  useEffect(() => {
    // Count-up animation for the number
    if (score === 0) return;
    let current = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 25);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="readiness-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--chart-bg-circle)"
          strokeWidth={stroke}
        />
        {/* Animated foreground arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        {/* Score number */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="2rem"
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {displayScore}
        </text>
        {/* Label */}
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize="0.65rem"
          fontFamily="Inter, sans-serif"
        >
          {label}
        </text>
      </svg>
      <p className="gauge-title">Team Readiness</p>
    </div>
  );
}
