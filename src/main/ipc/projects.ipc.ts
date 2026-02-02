import { ipcMain, type IpcMainInvokeEvent, dialog } from 'electron';
import { getDatabase, saveDatabase } from '../services/db';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

// Generate a unique ID
function generateId(): string {
  return randomBytes(16).toString('hex');
}

// Detect tech stack from project files
function detectTechStack(projectPath: string): string[] {
  const techStack: string[] = [];

  try {
    // Check for various framework/language indicators
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8')
      );

      // Detect Node.js-based frameworks
      if (packageJson.dependencies || packageJson.devDependencies) {
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if (deps.react) techStack.push('React');
        if (deps.next) techStack.push('Next.js');
        if (deps.vue) techStack.push('Vue');
        if (deps.angular || deps['@angular/core']) techStack.push('Angular');
        if (deps.svelte) techStack.push('Svelte');
        if (deps.express) techStack.push('Express');
        if (deps.fastify) techStack.push('Fastify');
        if (deps.typescript) techStack.push('TypeScript');
      }

      if (!techStack.includes('React') && !techStack.includes('Vue')) {
        techStack.push('Node.js');
      }
    }

    // Check for Python
    if (
      fs.existsSync(path.join(projectPath, 'requirements.txt')) ||
      fs.existsSync(path.join(projectPath, 'pyproject.toml')) ||
      fs.existsSync(path.join(projectPath, 'setup.py'))
    ) {
      techStack.push('Python');

      // Check for Django
      if (fs.existsSync(path.join(projectPath, 'manage.py'))) {
        techStack.push('Django');
      }

      // Check for Flask
      const files = fs.readdirSync(projectPath);
      if (files.some((f) => f.includes('app.py') || f.includes('wsgi.py'))) {
        // Could be Flask, but hard to detect for sure
        techStack.push('Flask');
      }
    }

    // Check for PHP
    if (fs.existsSync(path.join(projectPath, 'composer.json'))) {
      techStack.push('PHP');

      const composerJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'composer.json'), 'utf-8')
      );

      if (composerJson.require) {
        if (composerJson.require['laravel/framework']) {
          techStack.push('Laravel');
        }
        if (composerJson.require['symfony/symfony']) {
          techStack.push('Symfony');
        }
      }
    }

    // Check for .NET
    const csprojFiles = fs
      .readdirSync(projectPath)
      .filter((f) => f.endsWith('.csproj'));
    if (csprojFiles.length > 0) {
      techStack.push('.NET');
      techStack.push('C#');
    }

    // Check for Java
    if (
      fs.existsSync(path.join(projectPath, 'pom.xml')) ||
      fs.existsSync(path.join(projectPath, 'build.gradle'))
    ) {
      techStack.push('Java');

      if (fs.existsSync(path.join(projectPath, 'pom.xml'))) {
        techStack.push('Maven');
      }
      if (fs.existsSync(path.join(projectPath, 'build.gradle'))) {
        techStack.push('Gradle');
      }
    }

    // Check for Go
    if (fs.existsSync(path.join(projectPath, 'go.mod'))) {
      techStack.push('Go');
    }

    // Check for Rust
    if (fs.existsSync(path.join(projectPath, 'Cargo.toml'))) {
      techStack.push('Rust');
    }

    // Check for Ruby
    if (fs.existsSync(path.join(projectPath, 'Gemfile'))) {
      techStack.push('Ruby');

      const gemfile = fs.readFileSync(
        path.join(projectPath, 'Gemfile'),
        'utf-8'
      );
      if (gemfile.includes('rails')) {
        techStack.push('Ruby on Rails');
      }
    }

    // Always check for Docker
    if (
      fs.existsSync(path.join(projectPath, 'Dockerfile')) ||
      fs.existsSync(path.join(projectPath, 'docker-compose.yml'))
    ) {
      techStack.push('Docker');
    }
  } catch (error) {
    console.error('Error detecting tech stack:', error);
  }

  return techStack.length > 0 ? techStack : ['Unknown'];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  techStack: string[];
  githubRepo?: string;
  githubAccountId?: string;
  status: 'idle' | 'active' | 'paused' | 'completed' | 'error';
  progressPct: number;
  createdAt: string;
  updatedAt: string;
}

export function registerProjectsIpc() {
  // Create a new project
  ipcMain.handle(
    'projects:create',
    (
      _event: IpcMainInvokeEvent,
      data: {
        name: string;
        description?: string;
        path: string;
        techStack?: string[];
        githubRepo?: string;
        githubAccountId?: string;
      }
    ): Project => {
      const db = getDatabase();

      const id = generateId();
      const techStack = data.techStack || detectTechStack(data.path);
      const createdAt = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO projects (id, name, description, path, tech_stack, github_repo, github_account_id, status, progress_pct, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        id,
        data.name,
        data.description || null,
        data.path,
        JSON.stringify(techStack),
        data.githubRepo || null,
        data.githubAccountId || null,
        'idle',
        0,
        createdAt,
        createdAt,
      ]);

      stmt.free();
      saveDatabase();

      return {
        id,
        name: data.name,
        description: data.description,
        path: data.path,
        techStack,
        githubRepo: data.githubRepo,
        githubAccountId: data.githubAccountId,
        status: 'idle',
        progressPct: 0,
        createdAt,
        updatedAt: createdAt,
      };
    }
  );

  // List all projects
  ipcMain.handle('projects:list', (): Project[] => {
    const db = getDatabase();

    const result = db.exec(`
      SELECT id, name, description, path, tech_stack, github_repo, github_account_id, status, progress_pct, created_at, updated_at
      FROM projects
      ORDER BY updated_at DESC
    `);

    if (result.length === 0 || !result[0].values) {
      return [];
    }

    return result[0].values.map((row) => ({
      id: row[0] as string,
      name: row[1] as string,
      description: (row[2] as string | null) || undefined,
      path: row[3] as string,
      techStack: JSON.parse(row[4] as string),
      githubRepo: (row[5] as string | null) || undefined,
      githubAccountId: (row[6] as string | null) || undefined,
      status: row[7] as Project['status'],
      progressPct: row[8] as number,
      createdAt: row[9] as string,
      updatedAt: row[10] as string,
    }));
  });

  // Get a single project
  ipcMain.handle(
    'projects:get',
    (_event: IpcMainInvokeEvent, id: string): Project | null => {
      const db = getDatabase();

      const stmt = db.prepare(`
        SELECT id, name, description, path, tech_stack, github_repo, github_account_id, status, progress_pct, created_at, updated_at
        FROM projects
        WHERE id = ?
      `);

      stmt.bind([id]);

      if (!stmt.step()) {
        stmt.free();
        return null;
      }

      const row = stmt.getAsObject();
      stmt.free();

      return {
        id: row.id as string,
        name: row.name as string,
        description: (row.description as string | null) || undefined,
        path: row.path as string,
        techStack: JSON.parse(row.tech_stack as string),
        githubRepo: (row.github_repo as string | null) || undefined,
        githubAccountId: (row.github_account_id as string | null) || undefined,
        status: row.status as Project['status'],
        progressPct: row.progress_pct as number,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      };
    }
  );

  // Update a project
  ipcMain.handle(
    'projects:update',
    (
      _event: IpcMainInvokeEvent,
      id: string,
      updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
    ): boolean => {
      const db = getDatabase();

      const fields: string[] = [];
      const values: (string | number | null)[] = [];

      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }

      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description || null);
      }

      if (updates.techStack !== undefined) {
        fields.push('tech_stack = ?');
        values.push(JSON.stringify(updates.techStack));
      }

      if (updates.githubRepo !== undefined) {
        fields.push('github_repo = ?');
        values.push(updates.githubRepo || null);
      }

      if (updates.githubAccountId !== undefined) {
        fields.push('github_account_id = ?');
        values.push(updates.githubAccountId || null);
      }

      if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
      }

      if (updates.progressPct !== undefined) {
        fields.push('progress_pct = ?');
        values.push(updates.progressPct);
      }

      fields.push("updated_at = datetime('now')");
      values.push(id);

      const stmt = db.prepare(`
        UPDATE projects
        SET ${fields.join(', ')}
        WHERE id = ?
      `);

      stmt.run(values);
      const changes = db.getRowsModified();
      stmt.free();
      saveDatabase();

      return changes > 0;
    }
  );

  // Delete a project
  ipcMain.handle(
    'projects:delete',
    (_event: IpcMainInvokeEvent, id: string): boolean => {
      const db = getDatabase();

      const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
      stmt.run([id]);
      const changes = db.getRowsModified();
      stmt.free();
      saveDatabase();

      return changes > 0;
    }
  );

  // Import an existing project
  ipcMain.handle('projects:import', async (): Promise<Project | null> => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Project Folder',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const projectPath = result.filePaths[0];
    const name = path.basename(projectPath);
    const techStack = detectTechStack(projectPath);

    // Create the project
    const db = getDatabase();
    const id = generateId();
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO projects (id, name, path, tech_stack, status, progress_pct, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      id,
      name,
      projectPath,
      JSON.stringify(techStack),
      'idle',
      0,
      createdAt,
      createdAt,
    ]);

    stmt.free();
    saveDatabase();

    return {
      id,
      name,
      path: projectPath,
      techStack,
      status: 'idle',
      progressPct: 0,
      createdAt,
      updatedAt: createdAt,
    };
  });
}
