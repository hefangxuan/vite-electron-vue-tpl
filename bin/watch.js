#!/usr/bin/node

// TODO:
// - Disable dependency optimization during development.
// - Need more tests
// - Refactoring


const slash = require('slash');
const chokidar = require('chokidar');
const {createServer, build, normalizePath} = require('vite');
const electronPath = require('electron');
const {logProcess, logError} = require('hefx-utils');
const {spawn} = require('child_process');
const {join, relative} = require('path');

const mode = process.env.MODE || 'development';

const TIMEOUT = 600;

function debounce(f, ms) {
  let isCoolDown = false;
  return function () {
    if (isCoolDown) return;
    f.apply(this, arguments);
    isCoolDown = true;
    setTimeout(() => isCoolDown = false, ms);
  };
}

(async () => {

// Create Vite dev server
  const viteDevServer = await createServer({
    mode,
    configFile: join(process.cwd(), 'config/renderer.vite.js'),
  });

  await viteDevServer.listen();


// Determining the current URL of the server. It depend on /config/renderer.vite.js
// Write a value to an environment variable to pass it to the main process.
  {
    const protocol = `http${viteDevServer.config.server.https ? 's' : ''}:`;
    const host = viteDevServer.config.server.host || 'localhost';
    const port = viteDevServer.config.server.port; // Vite searches for and occupies the first free port: 3000, 3001, 3002 and so on
    const path = '/';
    process.env.VITE_DEV_SERVER_URL = `${protocol}//${host}:${port}${path}`;
  }


  /** @type {ChildProcessWithoutNullStreams | null} */
  let spawnProcess = null;
  const runMain = debounce(async () => {
    if (spawnProcess !== null) {
      spawnProcess.kill('SIGINT');
      spawnProcess = null;
    }

    spawnProcess = spawn(electronPath.toString(), [join(process.cwd(), 'dist/source/main/index.cjs.js')]);

    spawnProcess.stdout.on('data', d => {
      logProcess('Electron', d);
    });
    spawnProcess.stderr.on('data', d => {
      if (d.toString().includes('ExtensionLoadWarning: Warnings loading extension')) return;
      if (d.toString().includes('GL_INVALID_OPERATION')) return;
      logError('Electron', d);
    });
    // logProcessErrorOutput('Main', spawnProcess);
    // required on windows
    require('async-exit-hook')(() => {
      if (spawnProcess) spawnProcess.kill('SIGINT');
    });

    return spawnProcess;

  }, TIMEOUT);

  const buildMain = () => {
    return build({mode, configFile: join(process.cwd(), 'config/main.vite.js')});
  };

  const buildMainDebounced = debounce(buildMain, TIMEOUT);

  const runPreload = debounce((file) => {
    viteDevServer.ws.send({
      type: 'full-reload',
      path: '/' + slash(relative(viteDevServer.config.root, file)),
    });

  }, TIMEOUT);

  const buildPreload = () => {
    return build({mode, configFile: join(process.cwd(), 'config/preload.vite.js')});
  };

  const buildPreloadDebounced = debounce(buildPreload, TIMEOUT);


  await Promise.all([
    buildMain(),
    buildPreload(),
  ]);


  const watcher = chokidar.watch([
    join(process.cwd(), 'src/main/**'),
    join(process.cwd(), 'src/preload/**'),
    join(process.cwd(), 'dist/source/main/*.cjs.js'),
    join(process.cwd(), 'dist/source/preload/**'),
  ], {ignoreInitial: true});


  watcher
    .on('unlink', path => {
      const normalizedPath = normalizePath(path);
      if (spawnProcess !== null && normalizedPath.includes('/dist/source/main/')) {
        spawnProcess.kill('SIGINT');
        spawnProcess = null;
      }
    })
    .on('add', path => {
      const normalizedPath = normalizePath(path);
      if (normalizedPath.includes('/dist/source/main/')) {
        return runMain();
      }

      if (spawnProcess !== undefined && normalizedPath.includes('/dist/source/preload/')) {
        return runPreload(normalizedPath);
      }
    })
    .on('change', (path) => {
      const normalizedPath = normalizePath(path);

      if (normalizedPath.includes('/src/main/')) {
        return buildMainDebounced();
      }

      if (normalizedPath.includes('/dist/source/main/')) {
        return runMain();
      }

      if (normalizedPath.includes('/src/preload/')) {
        return buildPreloadDebounced();
      }

      if (normalizedPath.includes('/dist/source/preload/')) {
        return runPreload(normalizedPath);
      }
    });

  await runMain();

})();
