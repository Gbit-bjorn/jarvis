import { useState } from 'react';
import AuthSettings from '../components/settings/AuthSettings';
import AgentSettings from '../components/settings/AgentSettings';
import EnvironmentScanner from '../components/EnvironmentScanner';

type Tab = 'auth' | 'agents' | 'notifications' | 'about';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('auth');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'auth', label: 'Authentication' },
    { id: 'agents', label: 'Agent Settings' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'about', label: 'About' },
  ];

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

      {/* Tab Navigation */}
      <div className="border-b border-border-subtle flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-3 font-display font-semibold transition-all
              border-b-2 -mb-px
              ${
                activeTab === tab.id
                  ? 'border-primary text-primary glow-text'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'auth' && <AuthSettings />}

        {activeTab === 'agents' && <AgentSettings />}

        {activeTab === 'notifications' && (
          <div className="text-center py-12 text-text-muted">
            Notification settings coming later
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="jarvis-panel p-6 max-w-2xl">
              <h2 className="text-2xl font-display font-bold text-primary mb-4">
                JARVIS v1.0.0
              </h2>
              <p className="text-text-secondary mb-4">
                Autonomous Coding Agent Desktop Application
              </p>
              <div className="text-sm text-text-muted space-y-1">
                <p>Built with Electron, React, and TypeScript</p>
                <p>Powered by Claude AI</p>
                <p className="mt-4">
                  © 2026 Bjorn | MIT License
                </p>
              </div>
            </div>

            <EnvironmentScanner />
          </div>
        )}
      </div>
    </div>
  );
}
