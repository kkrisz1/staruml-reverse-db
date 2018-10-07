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
    return app.start().then(() => app.client.waitUntilWindowLoaded());
  }, 10000);

  afterEach(() => {
    if (app && app.isRunning()) {
      app.browserWindow.onbeforeunload = e => {
        console.log('I do want to be closed');
        e.returnValue = true;
      };
      app.client.window.onbeforeunload = app.browserWindow.onbeforeunload;
      app.client.browserWindow.onbeforeunload = app.browserWindow.onbeforeunload;
      // app.client.windowByIndex(0).electron.remote.window.onbeforeunload = app.browserWindow.onbeforeunload;
      app.client.windowByIndex(0).electron.remote.getGlobal('window')
          .then(e => e);
      return app.client.windowByIndex(0)
          .then(() => window.onbeforeunload = e => e.returnValue = true)
          .then(() => app.stop());
      // return app.stop();
    }
  });

  test('shows an initial window', () => {
    return app.client.getWindowCount()
        .then(count => {
          assert.equal(count, 1);
          // Please note that getWindowCount() will return 2 if `dev tools` are opened.
          // assert.equal(count, 2)
        })
  });

  test('sendAsync from renderer', async () => {
    app.electron.remote.ipcMain.on('ping', e => {
      e.sender.returnValue('pong');
    });
    console.log(await app.electron.ipcRenderer.sendSync('command', 'reverse-db-mysql:generate-erd')); // logs 'pong'
  });

  test('Generate ERD', async () => {
    // const res = await app.electron.remote.getGlobal('');
    const res1 = await app.electron.remote.getGlobal('app');
    // const res2 = await app.electron.remote.getGlobal('global');
    // return app.electron.remote.getGlobal("app").then(e => console.log(e));
    console.log(res1);
    console.log(res1.commands);
    // return app.electron.remote.app.getAppPath().then(e => console.log(e));

    // return app.electron.remote.app.commands.execute("reverse-db-mysql:generate-erd");

    // app.webContents.send('command', 'reverse-db-mysql:generate-erd');
    // app.client.element('#tools.db.mysql.generate.erd').then((e) => {
    //   console.log(e);
    //   done();
    // });

    // app.client.addCommand('sendIpcAndWaitForResponse', async (requireName, eventToSend, eventArgs, eventToListenTo) => {
    //   return this.executeAsync(($requireName, $eventToSend, $eventArgs, $eventToListenTo, done) => {
    //     const ipc = window[$requireName]('electron').ipcRenderer;
    //     ipc.once($eventToListenTo, function eventCallback() {
    //       done(Array.prototype.slice.call(arguments));
    //     });
    //     $eventArgs.unshift($eventToSend);
    //     ipc.send.apply(ipc, $eventArgs);
    //   }, requireName, eventToSend, eventArgs, eventToListenTo);
    // });
    //
    // const result = await app.client.sendIpcAndWaitForResponse(
    //     app.api.requireName,
    //     'command',
    //     ["reverse-db-mysql:generate-erd"],
    //     'command'
    // );
    // console.log(result);

    // app.mainProcess.send('command', 'reverse-db-mysql:generate-erd');
    // app.electron.ipcMain.on('msg-received', function (evt, payload) {
    //   payload.should.be("SUCCESS");
    //   done();
    // });
    //
    // app.electron.ipcRenderer.send("msg-received", "SUCCESS")
    // app.rendererProcess.env().then(env => console.log('renderer process env variables: ' + JSON.stringify(env)));
    // return app.client.getMainProcessLogs().then(logs => logs.forEach(log => console.log(log)));
  });
});