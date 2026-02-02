// Test component for P1-003: Verify Jarvis theme is working
function App() {
  return (
    <div className="w-full h-full bg-bg-primary flex items-center justify-center p-8">
      <div className="jarvis-panel relative jarvis-panel-corner-accents p-8 max-w-2xl">
        <h1 className="text-4xl font-display font-bold text-primary glow-text mb-4">
          JARVIS INITIALIZING...
        </h1>

        <p className="text-text-secondary font-body mb-6">
          Autonomous Coding Agent Desktop Application
        </p>

        <div className="space-y-4">
          {/* Test different glow effects */}
          <div className="jarvis-card p-4">
            <h2 className="text-xl font-display text-text-primary mb-2">
              System Status
            </h2>
            <div className="flex gap-4">
              <span className="status-active">● Active</span>
              <span className="status-success">● Success</span>
              <span className="status-warning">● Warning</span>
              <span className="status-error">● Error</span>
            </div>
          </div>

          {/* Test button styling */}
          <div className="flex gap-4">
            <button className="jarvis-button">
              Initialize
            </button>
            <button className="jarvis-button" disabled>
              Disabled
            </button>
          </div>

          {/* Test input styling */}
          <input
            type="text"
            className="jarvis-input w-full"
            placeholder="Enter command..."
          />

          {/* Test pulse animation */}
          <div className="jarvis-card p-4 pulse-active">
            <p className="font-code text-sm text-primary">
              Pulsing indicator (active agent)
            </p>
          </div>

          {/* Test scan line */}
          <div className="scan-line-container jarvis-card p-4 h-24">
            <div className="scan-line"></div>
            <p className="font-code text-sm text-text-secondary">
              Scan line animation
            </p>
          </div>
        </div>

        <p className="text-text-muted text-sm mt-6 font-code">
          v1.0.0 | Phase 1: Foundation | P1-003 Complete
        </p>
      </div>
    </div>
  );
}

export default App;
