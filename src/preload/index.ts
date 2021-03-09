import {ContextBridge, contextBridge, ipcRenderer} from 'electron';

const apiKey = 'electron';
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const api = {
  versions: process.versions,
  globalConfig: {
    get: (key: string) => ipcRenderer.invoke('globalConfig', key),
  },
} as const;


export type ExposedInMainWorld = Readonly<typeof api>;


if (import.meta.env.MODE !== 'test') {
  /**
   * The "Main World" is the JavaScript context that your main renderer code runs in.
   * By default, the page you load in your renderer executes code in this world.
   *
   * @see https://www.electronjs.org/docs/api/context-bridge
   */
  contextBridge.exposeInMainWorld(apiKey, api);


} else {
  type API = Parameters<ContextBridge['exposeInMainWorld']>[1]

  /**
   * Recursively Object.freeze() on objects and functions
   * @see https://github.com/substack/deep-freeze
   * @param obj Object on which to lock the attributes
   */
  function deepFreeze<T extends API>(obj: T): Readonly<T> {
    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach(prop => {
      // @ts-ignore
      if (obj.hasOwnProperty(prop)
        // @ts-ignore
        && obj[prop] !== null
          // @ts-ignore
        && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function')
          // @ts-ignore
        && !Object.isFrozen(obj[prop])) {
        // @ts-ignore
        deepFreeze(obj[prop]);
      }
    });

    return obj;
  }

  deepFreeze(api);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-var-requires
  (window as any).electronRequire = require;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)[apiKey] = api;
}
