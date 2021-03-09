import store from 'electron-store';

store.initRenderer();

interface StoreOptions {
  /**
   * defaults
   * Type: object
   * Default values for the store items.
   * 注意：defaults中的值将覆盖schema选项中的default键。
   */
  defaults?: any;

  /**
   * schema
   * type: object
   * JSON Schema to validate your config data.
   * Under the hood, the JSON Schema validator ajv is used to validate your config. We use JSON Schema draft-07 and support all validation keywords and formats.
   * You should define your schema as an object where each key is the name of your data's property and each value is a JSON schema used to validate that property. See more here.
   */
  schema?: any;

  /**
   * migrations
   * Type: object
   * You can use migrations to perform operations to the store whenever a version is upgraded.
   * The migrations object should consist of a key-value pair of 'version': handler. The version can also be a semver range.
   */
  migrations?: any;

  /**
   * name
   * Type: string
   * Default: 'config'
   * Name of the storage file (without extension).
   * This is useful if you want multiple storage files for your app. Or if you're making a reusable Electron module that persists some data, in which case you should not use the name config.
   */
  name?: string;

  /**
   * cwd
   * Type: string
   * Default: app.getPath('userData')
   * Storage file location. Don't specify this unless absolutely necessary! By default, it will pick the optimal location by adhering to system conventions. You are very likely to get this wrong and annoy users.
   * If a relative path, it's relative to the default cwd. For example, {cwd: 'unicorn'} would result in a storage file in ~/Library/Application Support/App Name/unicorn.
   */
  cwd?: string;

  /**
   * encryptionKey
   * Type: string | Buffer | TypedArray | DataView
   * Default: undefined
   * This can be used to secure sensitive data if the encryption key is stored in a secure manner (not plain-text) in the Node.js app. For example, by using node-keytar to store the encryption key securely, or asking the encryption key from the user (a password) and then storing it in a variable.
   * In addition to security, this could be used for obscurity. If a user looks through the config directory and finds the config file, since it's just a JSON file, they may be tempted to modify it. By providing an encryption key, the file will be obfuscated, which should hopefully deter any users from doing so.
   * It also has the added bonus of ensuring the config file's integrity. If the file is changed in any way, the decryption will not work, in which case the store will just reset back to its default state.
   * When specified, the store will be encrypted using the aes-256-cbc encryption algorithm.
   */
  encryptionKey?: string | Buffer | NodeJS.TypedArray | DataView;

  /**
   * fileExtension
   * Type: string
   * Default: 'json'
   * Extension of the config file.
   * You would usually not need this, but could be useful if you want to interact with a file with a custom file extension that can be associated with your app. These might be simple save/export/preference files that are intended to be shareable or saved outside of the app.
   */
  fileExtension?: string;

  /**
   * clearInvalidConfig
   * Type: boolean
   * Default: false
   * The config is cleared if reading the config file causes a SyntaxError. This is a good behavior for unimportant data, as the config file is not intended to be hand-edited, so it usually means the config is corrupt and there's nothing the user can do about it anyway. However, if you let the user edit the config file directly, mistakes might happen and it could be more useful to throw an error when the config is invalid instead of clearing.
   */
  clearInvalidConfig?: boolean;

  /**
   * serialize
   * Type: Function
   * Default: value => JSON.stringify(value, null, '\t')
   * Function to serialize the config object to a UTF-8 string when writing the config file.
   * You would usually not need this, but it could be useful if you want to use a format other than JSON.
   */
  serialize?: any;

  /**
   * deserialize
   * Type: Function
   * Default: JSON.parse
   * Function to deserialize the config object from a UTF-8 string when reading the config file.
   * You would usually not need this, but it could be useful if you want to use a format other than JSON.
   */
  deserialize?: any;

  /**
   * accessPropertiesByDotNotation
   * Type: boolean
   * Default: true
   * Accessing nested properties by dot notation. For example:
   */
  accessPropertiesByDotNotation?: boolean;

  /**
   * watch
   * Type: boolean
   * Default: false
   * Watch for any changes in the config file and call the callback for onDidChange or onDidAnyChange if set. This is useful if there are multiple processes changing the same config file, for example, if you want changes done in the main process to be reflected in a renderer process.
   */
  watch?: boolean;
}

export class Store {
  private store: store;
  constructor(options: StoreOptions) {
    // eslint-disable-next-line new-cap
    this.store = new store(options);
  }
  public get(name: string | string[], defaultValue?: any): any {
    if (Array.isArray(name)) {
      return name.map((n) => this.store.get(n, defaultValue));
    }
    return this.store.get(name, defaultValue);
  }
  public set(key: string, val: any): void {
    this.store.set(key, val);
  }
  public delete(key: string | string[]): void {
    if (Array.isArray(key)) {
      key.forEach((k) => this.store.delete(k));
    } else {
      this.store.delete(key);
    }
  }
}
