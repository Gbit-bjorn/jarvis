interface ScanLineProps {
  speed?: 'slow' | 'normal' | 'fast';
}

const speedDurations = {
  slow: '4s',
  normal: '3s',
  fast: '2s',
};

export default function ScanLine({ speed = 'normal' }: ScanLineProps) {
  return (
    <div
      className="scan-line"
      style={{
        animationDuration: speedDurations[speed],
      }}
    />
  );
}
