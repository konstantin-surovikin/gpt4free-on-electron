import { app } from 'electron';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export const conversationsPath: string = path.join(app.getPath('sessionData'), 'conversations.json');
export const distPaths: string = path.join(__dirname, '..', '..', 'dist');
export const javascriptAssets: string = path.join(__dirname, '..', '..', 'assets', 'js');
export const imageAssets: string = path.join(__dirname, '..', '..', 'assets', 'img');
export const temporaryDirectory: string = '/tmp/gpt4free-electron';
export const viewPath: string = path.join(__dirname, '..', '..', 'views');

if (!fs.existsSync(temporaryDirectory)){
  fs.mkdirSync(temporaryDirectory);
}
