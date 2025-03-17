import { BrowserWindow, app, shell } from 'electron';
import type {
  BrowserWindowConstructorOptions,
  HandlerDetails,
  WebContents,
  WindowOpenHandlerResponse,
} from 'electron';
import { imageAssets, javascriptAssets, viewPath } from './paths.js';
import fs from 'fs';
import path from 'path';
import skip from './skip.js';

const decoder: TextDecoder = new TextDecoder('UTF-8');
function appendJsFile<T>(window: BrowserWindow, filename: string): Promise<T> {
  return window.webContents.executeJavaScript(
    decoder.decode(fs.readFileSync(path.join(javascriptAssets, filename))),
  );
}

const quit: () => void = app.quit.bind(app);
function whenClosed(window: BrowserWindow): Promise<void> {
  return new Promise<void>(function (resolve: () => void): void {
    window.on('close', resolve);
  });
}

class WindowLoads {
  public readonly stoppedGracefully: Promise<void>;

  constructor(public readonly window: BrowserWindow) {
    this.stoppedGracefully = Promise.race([whenClosed(window)]);
    const webContents: WebContents = window.webContents;
    webContents.setWindowOpenHandler(function ({
      url,
    }: HandlerDetails): WindowOpenHandlerResponse {
      shell.openExternal(url).catch(skip);

      return { action: 'deny' };
    });
  }

  loadingPage(): Promise<void> {
    return Promise.race([
      this.stoppedGracefully,
      this.window
        .off('closed', quit)
        .loadFile(path.join(viewPath, 'load.html')),
    ]);
  }

  errorPage(): Promise<void> {
    return Promise.race([
      this.stoppedGracefully,
      this.window
        .once('closed', quit)
        .loadFile(path.join(viewPath, 'error.html')),
    ]);
  }

  async goto(url: string): Promise<void> {
    return Promise.race([
      this.stoppedGracefully,
      this.window.off('closed', quit).loadURL(url),
    ]);
  }

  async close(): Promise<void> {
    return Promise.race([this.stoppedGracefully, this.window.close()]);
  }

  appendJsFile<T>(filename: string): Promise<T | undefined> {
    return Promise.race([
      this.stoppedGracefully.then((): undefined => undefined),
      appendJsFile<T>(this.window, filename),
    ]);
  }

  setTitle(title: string): void {
    this.window.setTitle(title);
  }

  showMessage(message: string): void {
    this.window.webContents.send('show-message', message);
  }
}

export type WindowLoadsInterface = WindowLoads;
export async function createWindowLoads(
  windowOptions: BrowserWindowConstructorOptions = {},
): Promise<WindowLoadsInterface> {
  return app.whenReady().then(
    (): WindowLoadsInterface =>
      new WindowLoads(
        new BrowserWindow({
          ...windowOptions,
          icon: path.join(imageAssets, 'icon.png'),
          webPreferences: {
            devTools: ['dev', 'devel', 'development'].includes(
              process.env.NODE_ENVIRONMENT ?? '',
            ),
            contextIsolation: false,
            nodeIntegration: true,
          },
        }),
      ),
  );
}
