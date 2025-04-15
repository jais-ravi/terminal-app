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

  // Select shell: WSL for Windows, zsh for macOS, bash for Linux  
  const shell = os.platform() === 'win32' ? 'wsl' : os.platform() === 'darwin' ? 'zsh' : 'bash';

  ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  // Send data from shell to renderer
  ptyProcess.onData(data => {
    win.webContents.send('terminal-output', data);
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