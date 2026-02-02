import { APP_NAME } from '@shared/constants';

export default function TopBar() {
  const handleMinimize = () => {
    window.jarvis.windowMinimize();
  };

  const handleMaximize = () => {
    window.jarvis.windowMaximize();
  };

  const handleClose = () => {
    window.jarvis.windowClose();
  };

  return (
    <div
      className="h-12 bg-bg-elevated border-b border-border-subtle flex items-center justify-between px-4"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* App name */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary glow-sm pulse-active" />
        <h1 className="text-lg font-display font-bold text-primary glow-text">
          {APP_NAME}
        </h1>
      </div>

      {/* Window controls */}
      <div
        className="flex gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="w-8 h-8 rounded hover:bg-bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Minimize"
        >
          <svg
            width="12"
            height="2"
            viewBox="0 0 12 2"
            fill="currentColor"
          >
            <rect width="12" height="2" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="w-8 h-8 rounded hover:bg-bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Maximize"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <rect x="0.5" y="0.5" width="11" height="11" />
          </svg>
        </button>

        <button
          onClick={handleClose}
          className="w-8 h-8 rounded hover:bg-error flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1 1 L11 11 M11 1 L1 11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
