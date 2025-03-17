import type { AddressInfo } from 'net';
import net from 'net';

function isAddressInfo(anything: any): anything is AddressInfo {
  return Boolean(
    anything && typeof anything === 'object' && 'port' in anything,
  );
}

export default (): Promise<number | null> =>
  new Promise<number | null>(function (
    resolve: (value: number | null) => void,
  ): void {
    const server = net.createServer();
    server.listen(0, function (): void {
      const address = server.address();
      server.close();
      resolve(isAddressInfo(address) ? address?.port : null);
    });
  });
