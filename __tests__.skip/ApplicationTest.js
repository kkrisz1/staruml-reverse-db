const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

describe('Application launch', () => {
  let app = null;

  beforeEach(() => {
    app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      path: electronPath,

      // Assuming you have the following directory structure

      //  |__ my project
      //     |__ ...
      //     |__ main.js
      //     |__ package.json
      //     |__ index.html
      //     |__ ...
      //     |__ test
      //        |__ spec.js  <- You are here! ~ Well you should be.

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: ['c:\\Program Files\\StarUML\\resources\\app.asar']
    });
    return app.start()
  }, 10000);

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  });

  test('shows an initial window', () => {
    return app.client.getWindowCount().then(count => {
      assert.equal(count, 1);
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    });
  });

  test('gen erd', async () => {
    return app.client.getWindowCount().then(count => {
      assert.equal(count, 1);
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    });
  });

  test('generate ERD', async () => {
    // await app.client.waitUntilWindowLoaded()
    //     .pause(3000);
    // const menu = await app.electron.remote.Menu.getApplicationMenu();
    // menu.getItemByNames('Help', 'About StarUML').click();
    app.electron.clipboard.writeText('pasta');
    // app.electron.clipboard.readText().then(clipboardText => console.log('The clipboard text is ' + clipboardText));
    const clipboardText = await app.electron.clipboard.readText();
    console.log('The clipboard text is ' + clipboardText);
  });

  test('generate ERD2', async () => {
    app.electron.remote.ipcMain.on('ping', e => {
      e.sender.returnValue('pong');
    });
    console.log(await app.electron.ipcRenderer.sendSync('command', 'reverse-db-mysql:generate-erd')); // logs 'pong'
  });
});