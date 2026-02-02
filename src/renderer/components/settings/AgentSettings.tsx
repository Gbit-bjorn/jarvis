import { useState, useEffect } from 'react';
import { GlowPanel } from '../hud';

interface AgentSettingsValues {
  max_parallel_agents: number;
  max_iterations_per_feature: number;
  context_warn_threshold: number;
  context_rotate_threshold: number;
  cpu_threshold: number;
  ram_threshold: number;
  autonomous_mode: boolean;
}

export default function AgentSettings() {
  const [settings, setSettings] = useState<AgentSettingsValues>({
    max_parallel_agents: 5,
    max_iterations_per_feature: 35,
    context_warn_threshold: 70000,
    context_rotate_threshold: 80000,
    cpu_threshold: 80,
    ram_threshold: 85,
    autonomous_mode: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = (await window.jarvis.invoke(
      'settings:get-all'
    )) as Record<string, string>;

    setSettings({
      max_parallel_agents: parseInt(result.max_parallel_agents || '5'),
      max_iterations_per_feature: parseInt(
        result.max_iterations_per_feature || '35'
      ),
      context_warn_threshold: parseInt(result.context_warn_threshold || '70000'),
      context_rotate_threshold: parseInt(
        result.context_rotate_threshold || '80000'
      ),
      cpu_threshold: parseInt(result.cpu_threshold || '80'),
      ram_threshold: parseInt(result.ram_threshold || '85'),
      autonomous_mode: result.autonomous_mode === 'true',
    });
  };

  const handleSave = async () => {
    setSaving(true);

    const updates: Record<string, string> = {
      max_parallel_agents: settings.max_parallel_agents.toString(),
      max_iterations_per_feature: settings.max_iterations_per_feature.toString(),
      context_warn_threshold: settings.context_warn_threshold.toString(),
      context_rotate_threshold: settings.context_rotate_threshold.toString(),
      cpu_threshold: settings.cpu_threshold.toString(),
      ram_threshold: settings.ram_threshold.toString(),
      autonomous_mode: settings.autonomous_mode.toString(),
    };

    await window.jarvis.invoke('settings:update-batch', updates);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <GlowPanel title="Agent Execution Settings" className="p-6">
        <div className="space-y-6">
          {/* Max Parallel Agents */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-text-secondary">
                Max Parallel Agents
              </label>
              <span className="text-xl font-display font-bold text-primary">
                {settings.max_parallel_agents}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.max_parallel_agents}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_parallel_agents: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-text-muted mt-1">
              Maximum number of coding agents that can run simultaneously
            </p>
          </div>

          {/* Max Iterations */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-text-secondary">
                Max Iterations Per Feature
              </label>
              <span className="text-xl font-display font-bold text-primary">
                {settings.max_iterations_per_feature}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={settings.max_iterations_per_feature}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_iterations_per_feature: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-text-muted mt-1">
              Circuit breaker: stop agent after this many iterations
            </p>
          </div>

          {/* Autonomous Mode */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-text-secondary">
                Autonomous Mode
              </label>
              <p className="text-xs text-text-muted mt-1">
                Agents run automatically without manual approval
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  autonomous_mode: !settings.autonomous_mode,
                })
              }
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${
                  settings.autonomous_mode
                    ? 'bg-primary glow-sm'
                    : 'bg-border-subtle'
                }
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 rounded-full bg-bg-primary
                  transition-transform
                  ${settings.autonomous_mode ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </GlowPanel>

      <GlowPanel title="Context Management" className="p-6">
        <div className="space-y-6">
          {/* Context Warn Threshold */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-text-secondary">
                Context Warning Threshold
              </label>
              <span className="text-xl font-display font-bold text-warning">
                {(settings.context_warn_threshold / 1000).toFixed(0)}k
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="150000"
              step="5000"
              value={settings.context_warn_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  context_warn_threshold: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-text-muted mt-1">
              Warn when context exceeds this token count
            </p>
          </div>

          {/* Context Rotate Threshold */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-text-secondary">
                Context Rotation Threshold
              </label>
              <span className="text-xl font-display font-bold text-error">
                {(settings.context_rotate_threshold / 1000).toFixed(0)}k
              </span>
            </div>
            <input
              type="range"
              min="60000"
              max="180000"
              step="5000"
              value={settings.context_rotate_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  context_rotate_threshold: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-text-muted mt-1">
              Force context rotation when this token count is reached
            </p>
          </div>
        </div>
      </GlowPanel>

      <GlowPanel title="Resource Limits" className="p-6">
        <div className="space-y-6">
          {/* CPU Threshold */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-text-secondary">
                CPU Threshold
              </label>
              <span className="text-xl font-display font-bold text-primary">
                {settings.cpu_threshold}%
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={settings.cpu_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cpu_threshold: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-text-muted mt-1">
              Don't spawn new agents if CPU usage exceeds this percentage
            </p>
          </div>

          {/* RAM Threshold */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-text-secondary">
                RAM Threshold
              </label>
              <span className="text-xl font-display font-bold text-primary">
                {settings.ram_threshold}%
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={settings.ram_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ram_threshold: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-text-muted mt-1">
              Don't spawn new agents if RAM usage exceeds this percentage
            </p>
          </div>
        </div>
      </GlowPanel>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`jarvis-button ${saved ? 'bg-success/10 border-success' : ''}`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
