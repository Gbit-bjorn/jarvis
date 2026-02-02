import { useState } from 'react';
import { GlowPanel } from './hud';

interface ToolInfo {
  name: string;
  version_found?: string;
  status: 'found' | 'missing' | 'wrong_version';
  version_required?: string;
}

interface ScanResults {
  tools: ToolInfo[];
  git_config: {
    name?: string;
    email?: string;
  };
  scanned_at: number;
}

export default function EnvironmentScanner() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);

  const handleScan = () => {
    setScanning(true);

    // TODO: Implement WebSocket connection to Python backend
    // For now, simulate scan results
    setTimeout(() => {
      setResults({
        tools: [
          { name: 'Node.js', version_found: 'v20.11.0', status: 'found' },
          { name: 'npm', version_found: '10.2.4', status: 'found' },
          { name: 'Python', version_found: 'Python 3.11.0', status: 'found' },
          { name: 'Git', version_found: 'git version 2.42.0', status: 'found' },
          { name: 'Docker', status: 'missing' },
          { name: 'PHP', status: 'missing' },
        ],
        git_config: {
          name: 'Bjorn',
          email: 'bjorn@example.com',
        },
        scanned_at: Date.now(),
      });
      setScanning(false);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'found':
        return <span className="text-success">✓</span>;
      case 'missing':
        return <span className="text-error">✗</span>;
      case 'wrong_version':
        return <span className="text-warning">⚠</span>;
      default:
        return null;
    }
  };

  return (
    <GlowPanel title="Environment Scanner" className="p-6" loading={scanning}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-text-secondary text-sm">
            Scan your system for development tools
          </p>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="jarvis-button"
          >
            {scanning ? 'Scanning...' : 'Scan Environment'}
          </button>
        </div>

        {results && (
          <div className="mt-6 space-y-4">
            {/* Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="jarvis-card p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tool.status)}
                      <span className="font-semibold text-text-primary">
                        {tool.name}
                      </span>
                    </div>
                    {tool.version_found && (
                      <p className="text-xs text-text-muted mt-1 font-code">
                        {tool.version_found}
                      </p>
                    )}
                    {tool.status === 'wrong_version' && tool.version_required && (
                      <p className="text-xs text-warning mt-1">
                        Required: {tool.version_required}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Git Config */}
            {results.git_config.name && (
              <GlowPanel variant="accent" className="p-4 mt-4">
                <h4 className="text-sm font-display font-semibold text-text-primary mb-2">
                  Git Configuration
                </h4>
                <div className="text-sm space-y-1">
                  <p className="text-text-secondary">
                    Name: <span className="text-primary">{results.git_config.name}</span>
                  </p>
                  <p className="text-text-secondary">
                    Email: <span className="text-primary">{results.git_config.email}</span>
                  </p>
                </div>
              </GlowPanel>
            )}

            <p className="text-xs text-text-muted text-center mt-4">
              Last scanned: {new Date(results.scanned_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </GlowPanel>
  );
}
