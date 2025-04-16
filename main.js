const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const pty = require('node-pty');

let ptyProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');

  // ✅ Cross-platform shell selection
  const platform = os.platform();
  const shell = platform === 'win32'
    ? process.env.ComSpec || 'cmd.exe'
    : platform === 'darwin'
      ? 'zsh'
      : 'bash';

  // ✅ Cross-platform cwd selection
  const cwd = platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
  
  // ✅ Spawn PTY
  ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd,
    env: process.env,
  });

  // Send data from shell to renderer
  ptyProcess.onData(data => {
    win.webContents.send('terminal-output', data);
  });

  ptyProcess.on('exit', (code, signal) => {
    console.log(`Shell exited with code ${code}, signal ${signal}`);
  });

  ptyProcess.on('error', err => {
    console.error('PTY Error:', err);
  });

  // Receive input from renderer
  ipcMain.on('terminal-input', (event, input) => {
    ptyProcess.write(input);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});