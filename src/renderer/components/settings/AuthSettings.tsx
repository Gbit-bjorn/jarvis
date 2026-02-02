import { useState, useEffect } from 'react';
import { GlowPanel } from '../hud';

interface AuthToken {
  id: string;
  provider: 'claude' | 'github' | 'gitlab' | 'bitbucket';
  label: string;
  accountName?: string;
  createdAt: string;
}

export default function AuthSettings() {
  const [tokens, setTokens] = useState<AuthToken[]>([]);
  const [loading, setLoading] = useState(true);

  // New token form
  const [provider, setProvider] = useState<AuthToken['provider']>('claude');
  const [label, setLabel] = useState('');
  const [token, setToken] = useState('');
  const [accountName, setAccountName] = useState('');

  const loadTokens = async () => {
    setLoading(true);
    const result = await window.jarvis.invoke('auth:list-tokens');
    setTokens(result as AuthToken[]);
    setLoading(false);
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim() || !token.trim()) {
      return;
    }

    await window.jarvis.invoke(
      'auth:store-token',
      provider,
      label,
      token,
      accountName || undefined
    );

    // Clear form
    setLabel('');
    setToken('');
    setAccountName('');

    // Reload tokens
    loadTokens();
  };

  const handleDeleteToken = async (id: string) => {
    if (confirm('Are you sure you want to delete this token?')) {
      await window.jarvis.invoke('auth:delete-token', id);
      loadTokens();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Token */}
      <GlowPanel title="Add Authentication Token" className="p-6">
        <form onSubmit={handleAddToken} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Provider
              </label>
              <select
                value={provider}
                onChange={(e) =>
                  setProvider(e.target.value as AuthToken['provider'])
                }
                className="jarvis-input w-full"
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="bitbucket">Bitbucket</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="jarvis-input w-full"
                placeholder="e.g., Personal, Work, School"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="jarvis-input w-full font-code"
              placeholder="Enter your token..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Account Name (optional)
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="jarvis-input w-full"
              placeholder="e.g., bjorn@example.com"
            />
          </div>

          <button type="submit" className="jarvis-button">
            Add Token
          </button>
        </form>
      </GlowPanel>

      {/* Existing Tokens */}
      <GlowPanel title="Saved Tokens" className="p-6" loading={loading}>
        {tokens.length === 0 ? (
          <p className="text-center py-8 text-text-muted">
            No tokens saved yet
          </p>
        ) : (
          <div className="space-y-3">
            {tokens.map((t) => (
              <div
                key={t.id}
                className="jarvis-card p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-code text-primary">
                      {t.provider.toUpperCase()}
                    </span>
                    <span className="text-text-primary font-semibold">
                      {t.label}
                    </span>
                  </div>
                  {t.accountName && (
                    <p className="text-sm text-text-secondary mt-1">
                      {t.accountName}
                    </p>
                  )}
                  <p className="text-xs text-text-muted mt-1">
                    Added: {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteToken(t.id)}
                  className="text-error hover:text-error/80 transition-colors px-3 py-1 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </GlowPanel>
    </div>
  );
}
