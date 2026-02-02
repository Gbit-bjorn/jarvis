import { GlowPanel } from '../components/hud';

export default function Planner() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-primary glow-text">
          Feature Planner
        </h1>
        <p className="text-text-secondary mt-1">
          Plan and organize project features
        </p>
      </header>

      <GlowPanel cornerAccents className="p-6">
        <div className="text-center py-12 text-text-muted">
          Select a project to start planning
        </div>
      </GlowPanel>
    </div>
  );
}
