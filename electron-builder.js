const { appName, version: appVersion, appId } = require('./package.json');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  // 软件名称
  productName: appName,
  // 版本
  buildVersion: appVersion,
  // 包名
  appId,
  asar: false,
  // 删除package.json 中的scripts 自定义命令
  removePackageScripts: true,
  // 配置打包生成目录及自动版本分目录
  directories: {
    // eslint-disable-next-line no-template-curly-in-string
    output: 'dist/app/release/${buildVersion}_setup',
    buildResources: 'build',
    app: 'dist/source',
  },
  // mac 配置
  mac: {
    target: ['dmg', 'zip'],
  },
  // win 配置
  win: {
    target: 'nsis',
    icon: 'src/public/icon.ico',
  },
  // 关于自动更新的
  publish: [
    {
      provider: 'generic',
      url: '',
    },
  ],
  // win安装文件配置
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
    menuCategory: true,
    allowElevation: true,
    // 生成的安装包名字
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${productName}_Setup_${buildVersion}.${ext}',
    // 安装后的快捷方式名字
    // eslint-disable-next-line no-template-curly-in-string
    shortcutName: '${productName} v${buildVersion}',
  },
  // 添加要引入的文件,!是不引入即排除
  // files: [
  //   '!node_modules/*/**',
  // ],
};
