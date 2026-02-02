import { type ReactNode } from 'react';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  children?: ReactNode;
}

function getColorFromValue(value: number): string {
  if (value >= 100) return '#00FF88'; // Green (complete)
  if (value >= 80) return '#00FFE0'; // Turquoise (nearly complete)
  if (value >= 50) return '#00D4FF'; // Cyan (progress)
  if (value >= 25) return '#FFB800'; // Amber (warning)
  return '#FF3366'; // Red (low/error)
}

export default function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  children,
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;
  const color = getColorFromValue(normalizedValue);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(26, 42, 58, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            <span className="text-2xl font-display font-bold text-primary">
              {Math.round(normalizedValue)}%
            </span>
            {label && (
              <span className="text-xs text-text-muted mt-1 font-code">
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
