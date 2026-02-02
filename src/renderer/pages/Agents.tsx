import { GlowPanel } from '../components/hud';

export default function Agents() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-primary glow-text">
          Agents
        </h1>
        <p className="text-text-secondary mt-1">
          Monitor and manage coding agents
        </p>
      </header>

      <GlowPanel cornerAccents className="p-6">
        <div className="text-center py-12 text-text-muted">
          No active agents
        </div>
      </GlowPanel>
    </div>
  );
}
