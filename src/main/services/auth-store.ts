import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { app } from 'electron';
import os from 'os';
import { getDatabase, saveDatabase } from './db';

// Algorithm for encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// Generate a machine-specific encryption key
function getMachineKey(): Buffer {
  // Create a deterministic key from machine identifiers
  const machineId = `${os.hostname()}-${os.userInfo().username}-${app.getName()}`;

  // Hash the machine ID to create a 32-byte key for AES-256
  return createHash('sha256').update(machineId).digest();
}

// Encrypt a token
function encryptToken(plaintext: string): string {
  const key = getMachineKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted + authTag
  return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
}

// Decrypt a token
function decryptToken(ciphertext: string): string {
  const key = getMachineKey();

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const authTag = Buffer.from(parts[2], 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export interface AuthToken {
  id: string;
  provider: 'claude' | 'github' | 'gitlab' | 'bitbucket';
  label: string;
  accountName?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface AuthTokenWithPlaintext extends AuthToken {
  token: string;
}

// Generate a random ID for a token
function generateId(): string {
  return randomBytes(16).toString('hex');
}

// Store a new token
export function storeToken(
  provider: AuthToken['provider'],
  label: string,
  token: string,
  accountName?: string,
  expiresAt?: string
): string {
  const db = getDatabase();

  const id = generateId();
  const tokenEncrypted = encryptToken(token);
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO auth_tokens (id, provider, label, token_encrypted, account_name, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    id,
    provider,
    label,
    tokenEncrypted,
    accountName || null,
    createdAt,
    expiresAt || null,
  ]);

  stmt.free();
  saveDatabase();

  return id;
}

// Get a token by ID (with decrypted value)
export function getToken(id: string): AuthTokenWithPlaintext | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT id, provider, label, token_encrypted, account_name, created_at, expires_at
    FROM auth_tokens
    WHERE id = ?
  `);

  stmt.bind([id]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.getAsObject() as {
    id: string;
    provider: string;
    label: string;
    token_encrypted: string;
    account_name: string | null;
    created_at: string;
    expires_at: string | null;
  };

  stmt.free();

  const token = decryptToken(row.token_encrypted);

  return {
    id: row.id,
    provider: row.provider as AuthToken['provider'],
    label: row.label,
    accountName: row.account_name || undefined,
    token,
    createdAt: row.created_at,
    expiresAt: row.expires_at || undefined,
  };
}

// List all tokens (without decrypted values)
export function listTokens(): AuthToken[] {
  const db = getDatabase();

  const result = db.exec(`
    SELECT id, provider, label, account_name, created_at, expires_at
    FROM auth_tokens
    ORDER BY created_at DESC
  `);

  if (result.length === 0 || !result[0].values) {
    return [];
  }

  return result[0].values.map((row) => ({
    id: row[0] as string,
    provider: row[1] as AuthToken['provider'],
    label: row[2] as string,
    accountName: (row[3] as string | null) || undefined,
    createdAt: row[4] as string,
    expiresAt: (row[5] as string | null) || undefined,
  }));
}

// Delete a token
export function deleteToken(id: string): boolean {
  const db = getDatabase();

  const stmt = db.prepare('DELETE FROM auth_tokens WHERE id = ?');
  stmt.run([id]);
  const changes = db.getRowsModified();
  stmt.free();
  saveDatabase();

  return changes > 0;
}

// Update a token
export function updateToken(
  id: string,
  updates: {
    label?: string;
    token?: string;
    accountName?: string;
    expiresAt?: string;
  }
): boolean {
  const db = getDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.label !== undefined) {
    fields.push('label = ?');
    values.push(updates.label);
  }

  if (updates.token !== undefined) {
    fields.push('token_encrypted = ?');
    values.push(encryptToken(updates.token));
  }

  if (updates.accountName !== undefined) {
    fields.push('account_name = ?');
    values.push(updates.accountName);
  }

  if (updates.expiresAt !== undefined) {
    fields.push('expires_at = ?');
    values.push(updates.expiresAt);
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE auth_tokens
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  stmt.run(values);
  const changes = db.getRowsModified();
  stmt.free();
  saveDatabase();

  return changes > 0;
}
