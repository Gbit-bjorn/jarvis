import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import WebSocket from 'ws';

const PYTHON_BACKEND_PORT = 9721;
const MAX_RESTART_ATTEMPTS = 3;
const PING_INTERVAL = 5000; // 5 seconds

let pythonProcess: ChildProcess | null = null;
let ws: WebSocket | null = null;
let restartAttempts = 0;
let pingInterval: NodeJS.Timeout | null = null;

export async function startPythonBackend(): Promise<void> {
  if (pythonProcess) {
    console.log('[Python Bridge] Backend already running');
    return;
  }

  console.log('[Python Bridge] Starting Python backend...');

  // Python executable path
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';

  // Backend directory
  const backendDir = path.join(process.cwd(), 'backend');
  const mainScript = path.join(backendDir, 'main.py');

  // Spawn Python process
  pythonProcess = spawn(pythonExecutable, [mainScript], {
    cwd: backendDir,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Handle stdout
  pythonProcess.stdout?.on('data', (data) => {
    console.log(`[Python Backend] ${data.toString().trim()}`);
  });

  // Handle stderr
  pythonProcess.stderr?.on('data', (data) => {
    console.error(`[Python Backend Error] ${data.toString().trim()}`);
  });

  // Handle process exit
  pythonProcess.on('exit', (code, signal) => {
    console.log(`[Python Bridge] Process exited with code ${code}, signal ${signal}`);
    pythonProcess = null;

    if (ws) {
      ws.close();
      ws = null;
    }

    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }

    // Auto-restart if it crashed unexpectedly
    if (code !== 0 && restartAttempts < MAX_RESTART_ATTEMPTS) {
      restartAttempts++;
      console.log(`[Python Bridge] Attempting restart ${restartAttempts}/${MAX_RESTART_ATTEMPTS}...`);
      setTimeout(() => {
        startPythonBackend().catch((err) =>
          console.error('[Python Bridge] Restart failed:', err)
        );
      }, 2000);
    } else if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
      console.error('[Python Bridge] Max restart attempts reached');
    }
  });

  // Wait for backend to be ready, then connect WebSocket
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      connectWebSocket().then(resolve).catch((err) => {
        console.error('[Python Bridge] WebSocket connection failed:', err);
        resolve();
      });
    }, 2000); // Give Python 2 seconds to start
  });
}

async function connectWebSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('[Python Bridge] Connecting to WebSocket...');

    ws = new WebSocket(`ws://localhost:${PYTHON_BACKEND_PORT}`);

    ws.on('open', () => {
      console.log('[Python Bridge] WebSocket connected');
      restartAttempts = 0; // Reset on successful connection

      // Start ping/pong health check
      startHealthCheck();

      resolve();
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(message);
      } catch (err) {
        console.error('[Python Bridge] Failed to parse message:', err);
      }
    });

    ws.on('error', (err) => {
      console.error('[Python Bridge] WebSocket error:', err);
      reject(err);
    });

    ws.on('close', () => {
      console.log('[Python Bridge] WebSocket closed');
      ws = null;

      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
    });
  });
}

function startHealthCheck(): void {
  if (pingInterval) {
    clearInterval(pingInterval);
  }

  pingInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage({ type: 'ping', payload: { timestamp: Date.now() } });
    }
  }, PING_INTERVAL);
}

function handleWebSocketMessage(message: { type: string; payload: unknown }): void {
  console.log('[Python Bridge] Received message:', message.type);

  // Handle specific message types
  if (message.type === 'pong') {
    // Health check response
    return;
  }

  // Broadcast to renderer processes (will be implemented in Phase 4)
  // For now, just log
  console.log('[Python Bridge] Message:', message);
}

export function sendMessage(message: { type: string; payload: unknown }): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.warn('[Python Bridge] WebSocket not connected');
  }
}

export function stopPythonBackend(): void {
  console.log('[Python Bridge] Stopping Python backend...');

  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }

  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
    pythonProcess = null;
  }
}

export function isPythonBackendRunning(): boolean {
  return pythonProcess !== null && ws !== null && ws.readyState === WebSocket.OPEN;
}
