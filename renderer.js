const term = new Terminal({
    cursorBlink: true,
    theme: {
      background: '#000000',
      foreground: '#00FF00'
    }
  });
  
  term.open(document.getElementById('terminal'));
  term.write('Welcome to Linux Terminal!\r\n');
  
  term.onData(data => {
    window.electronAPI.sendInput(data);
  });
  
  window.electronAPI.onOutput(data => {
    term.write(data);
  });