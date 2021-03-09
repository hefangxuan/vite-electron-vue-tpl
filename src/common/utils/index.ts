import { globalConfig } from '../store';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import os from 'os';

/**
 * 判断实例数量处理退出
 * app: APP实例. num: 允许允许的实例数量
 */
export function isObjectNum(app: any, num: number) {
  // 锁定单实例
  const gotTheLock = app.requestSingleInstanceLock();

  // 如果为真,说明是第一个程序, 将本地技术设置 1
  if (gotTheLock) {
    globalConfig.set('elIndex', 1);
  }

  // 通过本地存储判断实例数
  let elIndex = <number>globalConfig.get('elIndex', 1);

  if (elIndex > num) {
    app.quit();
  }
  globalConfig.set('elIndex', elIndex + 1);
}

// /获取本机ip///
// eslint-disable-next-line consistent-return
export function getIPAdress(): any {
  const interfaces = os.networkInterfaces();
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const devName in interfaces) {
    const iface: any = interfaces[devName];
    for (let i = 0; i < iface.length; i += 1) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}
