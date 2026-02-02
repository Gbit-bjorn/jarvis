import { GlowPanel } from '../components/hud';

export default function Logs() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-primary glow-text">
          Logs
        </h1>
        <p className="text-text-secondary mt-1">
          View system and agent logs
        </p>
      </header>

      <GlowPanel cornerAccents className="p-6">
        <div className="font-code text-sm text-text-muted">
          <div className="text-success">[INFO] JARVIS initialized</div>
          <div className="text-primary">[INFO] Electron main process ready</div>
          <div className="text-text-secondary">[DEBUG] No active agents</div>
        </div>
      </GlowPanel>
    </div>
  );
}
