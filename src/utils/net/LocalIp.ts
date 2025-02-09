import os from 'os';

export function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  let localIP = '';

  for (const iface in interfaces) {
    const networkInterface = interfaces[iface];
    if (!networkInterface) continue;

    for (const alias of networkInterface) {if (alias.family === 'IPv4' && !alias.internal) {
        localIP = alias.address;
      }
    }
  }

  return localIP;
}
