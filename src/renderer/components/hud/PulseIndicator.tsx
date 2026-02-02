type PulseIndicatorStatus = 'active' | 'busy' | 'error' | 'idle';

interface PulseIndicatorProps {
  status: PulseIndicatorStatus;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const statusColors: Record<PulseIndicatorStatus, string> = {
  active: '#00FF88', // Green
  busy: '#FFB800', // Amber
  error: '#FF3366', // Red
  idle: '#6B7B8D', // Gray
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export default function PulseIndicator({
  status,
  size = 'md',
  label,
}: PulseIndicatorProps) {
  const color = statusColors[status];
  const shouldPulse = status === 'active' || status === 'busy';

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative inline-flex">
        {/* Main circle */}
        <div
          className={`${sizeClasses[size]} rounded-full`}
          style={{ backgroundColor: color }}
        />

        {/* Pulse ring */}
        {shouldPulse && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-ping`}
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {label && (
        <span className="text-sm font-code text-text-secondary">
          {label}
        </span>
      )}
    </div>
  );
}
