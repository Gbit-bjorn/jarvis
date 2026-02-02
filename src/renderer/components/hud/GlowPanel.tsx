import { type ReactNode } from 'react';

type GlowPanelVariant = 'default' | 'accent' | 'warning' | 'error';

interface GlowPanelProps {
  title?: string;
  children: ReactNode;
  loading?: boolean;
  variant?: GlowPanelVariant;
  className?: string;
  cornerAccents?: boolean;
}

const variantClasses: Record<GlowPanelVariant, string> = {
  default: 'border-border-glow/15 hover:border-border-glow/40',
  accent: 'border-accent/15 hover:border-accent/40',
  warning: 'border-warning/15 hover:border-warning/40',
  error: 'border-error/15 hover:border-error/40',
};

export default function GlowPanel({
  title,
  children,
  loading = false,
  variant = 'default',
  className = '',
  cornerAccents = false,
}: GlowPanelProps) {
  return (
    <div
      className={`
        jarvis-panel relative
        ${variantClasses[variant]}
        ${cornerAccents ? 'jarvis-panel-corner-accents' : ''}
        ${loading ? 'scan-line-container' : ''}
        ${className}
      `}
    >
      {loading && <div className="scan-line" />}

      {title && (
        <div className="border-b border-border-subtle/50 pb-3 mb-4">
          <h3 className="text-lg font-display font-semibold text-text-primary">
            {title}
          </h3>
        </div>
      )}

      <div className={loading ? 'opacity-50' : ''}>
        {children}
      </div>
    </div>
  );
}
