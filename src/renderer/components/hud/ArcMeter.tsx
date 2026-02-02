interface ArcMeterProps {
  value: number; // 0-100
  max?: number;
  label: string;
  thresholds?: {
    warning?: number; // Default 80
    critical?: number; // Default 90
  };
  size?: number;
}

export default function ArcMeter({
  value,
  max = 100,
  label,
  thresholds = {},
  size = 140,
}: ArcMeterProps) {
  const warningThreshold = thresholds.warning ?? 80;
  const criticalThreshold = thresholds.critical ?? 90;

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine color based on thresholds
  let color = '#00D4FF'; // Cyan (normal)
  if (percentage >= criticalThreshold) {
    color = '#FF3366'; // Red (critical)
  } else if (percentage >= warningThreshold) {
    color = '#FFB800'; // Amber (warning)
  }

  // Calculate arc path (180 degrees)
  const radius = (size - 20) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + 10;
  const startAngle = -180;
  const endAngle = 0;
  const angleRange = endAngle - startAngle;
  const valueAngle = startAngle + (percentage / 100) * angleRange;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const valuePoint = polarToCartesian(valueAngle);

  const backgroundPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  const valuePath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${percentage > 50 ? 1 : 0} 1 ${valuePoint.x} ${valuePoint.y}`;

  // Generate tick marks
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = startAngle + (i / 10) * angleRange;
    const innerPoint = polarToCartesian(angle);
    const outerRadius = radius + 5;
    const outerX = centerX + outerRadius * Math.cos((angle * Math.PI) / 180);
    const outerY = centerY + outerRadius * Math.sin((angle * Math.PI) / 180);

    ticks.push(
      <line
        key={i}
        x1={innerPoint.x}
        y1={innerPoint.y}
        x2={outerX}
        y2={outerY}
        stroke="rgba(107, 123, 141, 0.3)"
        strokeWidth="1"
      />
    );
  }

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size * 0.65} className="overflow-visible">
        {/* Tick marks */}
        {ticks}

        {/* Background arc */}
        <path
          d={backgroundPath}
          stroke="rgba(26, 42, 58, 0.3)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={valuePath}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color}60)`,
            transition: 'd 0.5s ease, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Value display */}
      <div className="mt-2 text-center">
        <div className="text-2xl font-display font-bold" style={{ color }}>
          {Math.round(percentage)}%
        </div>
        <div className="text-xs text-text-secondary font-code mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
