// ============================================================
// RiskScore — Componente de Score de Risco em Anel Animado
// Design: Intelligence Dashboard — anel SVG com gradiente de cor
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { getRiskColor, getRiskLabel } from '@/lib/mockData';

interface RiskScoreProps {
  score: number;
  nivel: 'critico' | 'alto' | 'medio' | 'baixo';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const sizeConfig = {
  sm: { radius: 28, stroke: 4, fontSize: 14, labelSize: 10, container: 64 },
  md: { radius: 40, stroke: 5, fontSize: 20, labelSize: 11, container: 92 },
  lg: { radius: 56, stroke: 6, fontSize: 28, labelSize: 12, container: 128 },
};

export function RiskScore({ score, nivel, size = 'md', showLabel = true, animated = true }: RiskScoreProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [dashOffset, setDashOffset] = useState(0);
  const animRef = useRef<number>(0);
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const color = getRiskColor(nivel);
  const label = getRiskLabel(nivel);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      setDashOffset(circumference * (1 - score / 100));
      return;
    }

    let start: number | null = null;
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = Math.round(eased * score);
      setDisplayScore(current);
      setDashOffset(circumference * (1 - (eased * score) / 100));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      animRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timeout);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [score, animated, circumference]);

  const cx = config.container / 2;
  const cy = config.container / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: config.container, height: config.container }} className="relative">
        <svg
          width={config.container}
          height={config.container}
          viewBox={`0 0 ${config.container} ${config.container}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={config.radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={config.stroke}
          />
          {/* Score arc */}
          <circle
            cx={cx}
            cy={cy}
            r={config.radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 6px ${color}60)`,
              transition: animated ? 'none' : 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>
        {/* Score number */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          <span
            style={{ fontSize: config.fontSize, fontWeight: 700, color, lineHeight: 1 }}
          >
            {displayScore}
          </span>
          <span style={{ fontSize: config.fontSize * 0.45, color: 'rgba(255,255,255,0.4)', fontFamily: 'Fira Code, monospace' }}>
            /100
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className="font-semibold tracking-wide uppercase"
          style={{ fontSize: config.labelSize, color, letterSpacing: '0.08em' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// Compact badge version
interface RiskBadgeProps {
  score: number;
  nivel: 'critico' | 'alto' | 'medio' | 'baixo';
  compact?: boolean;
}

export function RiskBadge({ score, nivel, compact = false }: RiskBadgeProps) {
  const color = getRiskColor(nivel);
  const label = getRiskLabel(nivel);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs font-medium border"
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}12`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
      />
      {compact ? score : `${score} — ${label}`}
    </span>
  );
}
