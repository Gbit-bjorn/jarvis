-- JARVIS Initial Database Schema
-- All timestamps are in UTC ISO 8601 format

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE TABLE projects (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  path TEXT NOT NULL UNIQUE,
  tech_stack TEXT NOT NULL, -- JSON array of technologies
  github_repo TEXT,
  github_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'idle' CHECK(status IN ('idle', 'active', 'paused', 'completed', 'error')),
  progress_pct REAL NOT NULL DEFAULT 0 CHECK(progress_pct >= 0 AND progress_pct <= 100),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- ============================================================================
-- FEATURE GROUPS & FEATURES
-- ============================================================================

CREATE TABLE feature_groups (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_feature_groups_project ON feature_groups(project_id, sort_order);

CREATE TABLE features (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES feature_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  detailed_spec TEXT, -- Enhanced spec from enhancement agent
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'review', 'approved', 'completed', 'failed')),
  requires_approval INTEGER NOT NULL DEFAULT 0, -- Boolean: 0 = no, 1 = yes
  approved INTEGER NOT NULL DEFAULT 0, -- Boolean: 0 = no, 1 = yes
  iteration_count INTEGER NOT NULL DEFAULT 0,
  max_iterations INTEGER NOT NULL DEFAULT 35,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX idx_features_project ON features(project_id, status);
CREATE INDEX idx_features_group ON features(group_id);

-- ============================================================================
-- AGENT SESSIONS & LOGS
-- ============================================================================

CREATE TABLE agent_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feature_id TEXT REFERENCES features(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL CHECK(agent_type IN ('initializer', 'coder', 'qa', 'enhancer', 'triage')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK(status IN ('idle', 'starting', 'running', 'paused', 'completed', 'failed', 'terminated')),
  iteration_number INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT
);

CREATE INDEX idx_agent_sessions_project ON agent_sessions(project_id, status);
CREATE INDEX idx_agent_sessions_feature ON agent_sessions(feature_id);

CREATE TABLE agent_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK(level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  details TEXT, -- JSON for structured data
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agent_logs_session ON agent_logs(session_id, timestamp DESC);
CREATE INDEX idx_agent_logs_level ON agent_logs(level, timestamp DESC);

-- ============================================================================
-- AUTHENTICATION & TOKENS
-- ============================================================================

CREATE TABLE auth_tokens (
  id TEXT PRIMARY KEY NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN ('claude', 'github', 'gitlab', 'bitbucket')),
  label TEXT NOT NULL,
  token_encrypted TEXT NOT NULL,
  account_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT
);

CREATE INDEX idx_auth_tokens_provider ON auth_tokens(provider);

-- ============================================================================
-- SETTINGS
-- ============================================================================

CREATE TABLE global_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL, -- JSON or plain text
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default settings
INSERT INTO global_settings (key, value) VALUES
  ('max_parallel_agents', '5'),
  ('max_iterations_per_feature', '35'),
  ('context_warn_threshold', '70000'),
  ('context_rotate_threshold', '80000'),
  ('cpu_threshold', '80'),
  ('ram_threshold', '85'),
  ('autonomous_mode', 'true');

-- ============================================================================
-- ENVIRONMENT SCANNING
-- ============================================================================

CREATE TABLE env_scan_results (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  version_found TEXT,
  version_required TEXT,
  status TEXT NOT NULL CHECK(status IN ('found', 'missing', 'wrong_version')),
  scanned_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_env_scan_project ON env_scan_results(project_id, scanned_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('approval_request', 'error_alert', 'completion_summary', 'info')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent INTEGER NOT NULL DEFAULT 0, -- Boolean
  reply_content TEXT,
  sent_at TEXT,
  replied_at TEXT
);

CREATE INDEX idx_notifications_project ON notifications(project_id, sent_at DESC);

-- ============================================================================
-- PROJECT MEMORY (Context/Notes)
-- ============================================================================

CREATE TABLE project_memory (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope TEXT NOT NULL, -- e.g., 'global', 'feature:123', 'agent:456'
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, scope, key)
);

CREATE INDEX idx_project_memory_project_scope ON project_memory(project_id, scope);

-- ============================================================================
-- SKILLS & PLUGINS
-- ============================================================================

CREATE TABLE skills (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL, -- Path or URL
  config TEXT, -- JSON configuration
  enabled INTEGER NOT NULL DEFAULT 1, -- Boolean
  installed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_skills_enabled ON skills(enabled);
