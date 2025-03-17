import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { WindowLoadsInterface } from './WindowLoads.js';
import { createWindowLoads } from './WindowLoads.js';
import skip from './skip.js';

export default function (severProcess: ChildProcessWithoutNullStreams): void {
  let stdoutData: string = '';
  let stderrData: string = '';

  severProcess.stdout.on('data', function (chunk: Buffer): void {
    stdoutData += chunk.toString();
  });
  severProcess.stderr.on('data', function (chunk: Buffer): void {
    stderrData += chunk.toString();
  });

  severProcess.on('exit', function (code: string): void {
    const windowPromise: Promise<WindowLoadsInterface> = createWindowLoads();
    code = code ?? '"Без кода"';
    const stdoutMarkup: string = stdoutData
      .split('\n')
      .map((line: string): string => `<p>${line}</p>`)
      .join('');
    const stderrMarkup: string = stderrData
      .split('\n')
      .map((line: string): string => `<p>${line}</p>`)
      .join('');
    const asyncWindowCreation = async function () {
      const window: WindowLoadsInterface = await windowPromise;
      await window.errorPage();
      window.setTitle('Error');
      window.showMessage(
        `<p>Сервер непредсказуемо завершился с кодом ${code}</p>` +
          `<h6>Stdout:</h6>${stdoutMarkup}<h6>Stderr:</h6>${stderrMarkup}`,
      );
    };
    asyncWindowCreation().catch(skip);
  });
}
