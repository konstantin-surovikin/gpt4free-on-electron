import type { WebContents } from 'electron';
import fs from 'fs';
import { javascriptAssets } from './paths.js';
import path from 'path';

export function appendJsFile<T>(
  webContents: WebContents,
  filename: string,
): Promise<T> {
  return webContents.executeJavaScript(
    new TextDecoder('UTF-8').decode(
      fs.readFileSync(path.join(javascriptAssets, filename)),
    ),
  );
}
