const {join} = require('path');
const vue = require('@vitejs/plugin-vue');
const {chrome} = require('./electron-vendors');
/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
module.exports = {
  root: join(process.cwd(), './src/renderer'),
  resolve: {
    alias: {
      '/@/': join(process.cwd(), './src/renderer') + '/',
    },
  },
  // plugins: [vue()],
  base: '',
  build: {
    // sourcemap: 'inline',
    target: `chrome${chrome}`,
    polyfillDynamicImport: false,
    outDir: join(process.cwd(), 'dist/source/renderer'),
    assetsDir: '.',
    rollupOptions: {
      external: require('./external-packages').default,
    },
    emptyOutDir: true,
  },
  // // 1. 如果使用的是ant-design 系列的 需要配置这个
  // // 2. 确保less安装在依赖 `yarn add less -D`
  // css: {
  //   preprocessorOptions: {
  //     less: {
  //       javascriptEnabled: true,
  //     },
  //   },
  // },
  plugins: [
    vue(),
  ],
};

