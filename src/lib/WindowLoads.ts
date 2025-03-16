import { BrowserWindow, app, shell } from 'electron';
import type { HandlerDetails, WebContents, WindowOpenHandlerResponse } from 'electron';
import { imageAssets, viewPath } from './paths.js';
import { appendJsFile } from './appendJsFile.js';
import path from 'path';

const quit = app.quit.bind(app);

class WindowLoads {
  constructor(
    public readonly window: BrowserWindow
  ) {
    const webContents: WebContents = window.webContents;
    app.on('second-instance', function(): void {
      window.restore();
      window.focus();
    });
    webContents.setWindowOpenHandler(function ({ url }: HandlerDetails): WindowOpenHandlerResponse {
      shell.openExternal(url);

      return { action: 'deny' };
    });
  }

  loadingPage() {
    return this.window
      .off('closed', quit)
      .loadFile(path.join(viewPath, 'load.html'));
  }

  errorPage() {
    return this.window
      .once('closed', quit)
      .loadFile(path.join(viewPath, 'error.html'));
  }

  async goto(url: string): Promise<void> {
    return this.window
      .off('closed', quit)
      .loadURL(url);
  }

  appendJsFile<T>(filename: string): Promise<T> {
    return appendJsFile<T>(this.window.webContents, filename);
  }

  setTitle(title: string): void {
    this.window.setTitle(title);
  }

  showMessage(message: string): void {
    this.window.webContents.send('show-message', message);
  }
}

export type WindowLoadsInterface = WindowLoads;
export async function createWindowLoads(): Promise<WindowLoadsInterface> {
  return app
    .whenReady()
    .then((): WindowLoadsInterface => new WindowLoads(
      new BrowserWindow({
        icon: path.join(imageAssets, 'icon.png'),
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: true
        }
      })
    ));
}
