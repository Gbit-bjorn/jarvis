import { GlowPanel, CircularProgress, ArcMeter, PulseIndicator } from '../components/hud';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-primary glow-text">
          Dashboard
        </h1>
        <p className="text-text-secondary mt-1">
          System overview and active projects
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Status */}
        <GlowPanel title="System Status" className="p-4">
          <div className="space-y-4">
            <ArcMeter value={35} label="CPU" size={120} />
            <ArcMeter value={52} label="RAM" size={120} />
          </div>
        </GlowPanel>

        {/* Overall Progress */}
        <GlowPanel title="Overall Progress" className="p-4">
          <div className="flex justify-center py-4">
            <CircularProgress value={10} label="4/39 Complete" size={140} />
          </div>
        </GlowPanel>

        {/* Active Agents */}
        <GlowPanel title="Active Agents" className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Total Agents</span>
              <span className="text-xl font-display font-bold text-primary">0</span>
            </div>
            <div className="space-y-2">
              <PulseIndicator status="idle" label="No agents running" />
            </div>
          </div>
        </GlowPanel>
      </div>

      <GlowPanel title="Recent Projects" cornerAccents className="p-6">
        <div className="text-center py-12 text-text-muted">
          No projects yet. Create your first project to get started.
        </div>
      </GlowPanel>
    </div>
  );
}
