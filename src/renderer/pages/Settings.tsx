import { GlowPanel } from '../components/hud';

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-primary glow-text">
          Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Configure JARVIS preferences
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlowPanel title="Authentication" className="p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Claude OAuth Token
              </label>
              <input
                type="password"
                className="jarvis-input w-full"
                placeholder="Enter token..."
              />
            </div>
            <button className="jarvis-button w-full">Save</button>
          </div>
        </GlowPanel>

        <GlowPanel title="Agent Settings" className="p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Max Parallel Agents: <span className="text-primary">5</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                defaultValue="5"
                className="w-full"
              />
            </div>
          </div>
        </GlowPanel>
      </div>
    </div>
  );
}
