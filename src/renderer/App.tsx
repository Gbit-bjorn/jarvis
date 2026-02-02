import {
  GlowPanel,
  CircularProgress,
  ArcMeter,
  PulseIndicator,
} from './components/hud';

// Test page for P1-004: HUD Component Library
function App() {
  return (
    <div className="w-full h-full bg-bg-primary overflow-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-primary glow-text mb-2">
            JARVIS HUD COMPONENTS
          </h1>
          <p className="text-text-secondary font-code">
            Phase 1 Foundation • P1-004 Complete
          </p>
        </header>

        {/* GlowPanel Variants */}
        <section>
          <h2 className="text-2xl font-display font-semibold text-text-primary mb-4">
            GlowPanel Component
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlowPanel title="Default Panel" className="p-4">
              <p className="text-text-secondary">
                Default variant with subtle glow border
              </p>
            </GlowPanel>

            <GlowPanel title="Accent Panel" variant="accent" className="p-4">
              <p className="text-text-secondary">
                Accent variant with turquoise glow
              </p>
            </GlowPanel>

            <GlowPanel title="Warning Panel" variant="warning" className="p-4">
              <p className="text-text-secondary">
                Warning variant with amber glow
              </p>
            </GlowPanel>

            <GlowPanel title="Error Panel" variant="error" className="p-4">
              <p className="text-text-secondary">Error variant with red glow</p>
            </GlowPanel>

            <GlowPanel
              title="Loading Panel"
              loading
              className="p-4"
              cornerAccents
            >
              <p className="text-text-secondary">
                Loading state with scan line animation and corner accents
              </p>
            </GlowPanel>

            <GlowPanel cornerAccents className="p-4">
              <p className="text-text-secondary">
                Panel with corner accents (no title)
              </p>
            </GlowPanel>
          </div>
        </section>

        {/* CircularProgress */}
        <section>
          <h2 className="text-2xl font-display font-semibold text-text-primary mb-4">
            CircularProgress Component
          </h2>
          <GlowPanel className="p-6">
            <div className="flex flex-wrap gap-8 justify-center">
              <CircularProgress value={15} label="Low" />
              <CircularProgress value={45} label="Warning" />
              <CircularProgress value={65} label="Progress" />
              <CircularProgress value={85} label="Nearly Done" />
              <CircularProgress value={100} label="Complete" />
              <CircularProgress value={75} size={160} strokeWidth={12}>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-primary">
                    75%
                  </div>
                  <div className="text-xs text-text-muted font-code">Custom</div>
                </div>
              </CircularProgress>
            </div>
          </GlowPanel>
        </section>

        {/* ArcMeter */}
        <section>
          <h2 className="text-2xl font-display font-semibold text-text-primary mb-4">
            ArcMeter Component (CPU/RAM Gauges)
          </h2>
          <GlowPanel className="p-6">
            <div className="flex flex-wrap gap-12 justify-center">
              <ArcMeter value={45} label="CPU Usage" />
              <ArcMeter value={72} label="RAM Usage" />
              <ArcMeter value={85} label="Warning Zone" />
              <ArcMeter value={95} label="Critical Zone" />
            </div>
          </GlowPanel>
        </section>

        {/* PulseIndicator */}
        <section>
          <h2 className="text-2xl font-display font-semibold text-text-primary mb-4">
            PulseIndicator Component
          </h2>
          <GlowPanel className="p-6">
            <div className="space-y-4">
              <div className="flex gap-6 flex-wrap">
                <PulseIndicator status="active" label="Active Agent" />
                <PulseIndicator status="busy" label="Processing" />
                <PulseIndicator status="error" label="Failed" />
                <PulseIndicator status="idle" label="Idle" />
              </div>

              <div className="flex gap-6 flex-wrap items-center">
                <PulseIndicator status="active" size="sm" label="Small" />
                <PulseIndicator status="busy" size="md" label="Medium" />
                <PulseIndicator status="error" size="lg" label="Large" />
              </div>

              <div className="flex gap-4">
                <PulseIndicator status="active" />
                <PulseIndicator status="busy" />
                <PulseIndicator status="error" />
                <PulseIndicator status="idle" />
              </div>
            </div>
          </GlowPanel>
        </section>

        {/* All Components Together */}
        <section>
          <h2 className="text-2xl font-display font-semibold text-text-primary mb-4">
            System Dashboard Preview
          </h2>
          <GlowPanel title="System Status" cornerAccents className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <CircularProgress value={67} label="Overall Progress" />
              </div>

              <div className="space-y-4">
                <ArcMeter value={42} label="CPU" />
                <ArcMeter value={68} label="RAM" />
              </div>

              <div className="space-y-3">
                <div className="jarvis-card p-3">
                  <PulseIndicator status="active" label="Agent #1: Building" />
                </div>
                <div className="jarvis-card p-3">
                  <PulseIndicator status="busy" label="Agent #2: Testing" />
                </div>
                <div className="jarvis-card p-3">
                  <PulseIndicator status="idle" label="Agent #3: Idle" />
                </div>
              </div>
            </div>
          </GlowPanel>
        </section>
      </div>
    </div>
  );
}

export default App;
