import { distPaths, temporaryDirectory } from './lib/paths.js';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import child_process from 'child_process';
import findFreePort from './lib/findFreePort.js';
import path from 'path';

interface gpt4FreeServerInfo {
  executionPromise: Promise<void>;
  port: number;
  severProcess: ChildProcessWithoutNullStreams;
}

const createServer: () => Promise<gpt4FreeServerInfo> =
  async function (): Promise<gpt4FreeServerInfo> {
    const port: number = (await findFreePort()) ?? -1;

    if (port === -1) {
      throw new Error('Unexpected null port returned on requesting one');
    }

    const severProcess: ChildProcessWithoutNullStreams = child_process.spawn(
      path.join(distPaths, 'server'),
      ['--port', port.toString()],
      { cwd: temporaryDirectory },
    );
    process.on('beforeExit', (): boolean => severProcess.kill());

    const executionPromise = new Promise<void>(function (
      resolve: () => void,
      reject: (error: Error) => void,
    ): void {
      severProcess.on('spawn', resolve);
      severProcess.on('error', reject);
    });

    return { executionPromise, port, severProcess };
  };

export default createServer;
