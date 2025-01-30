import { BrowserWindow, app } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (message: string): Promise<void> => app.whenReady()
  .then(function (): void {
    const window = new BrowserWindow({
      width: 400,
      height: 200,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
      icon: path.join(__dirname, '..', 'assets', 'img', 'icon.png')
    });
    const webContents = window.webContents;

    window.setTitle('Error');
    window.loadFile(path.join(__dirname, '..', 'views', 'error.html'));
    webContents.once('did-finish-load', function () {
      webContents.send('show-message', message);
    });

    window.on('closed', function () {
      app.quit();
    });
  });
