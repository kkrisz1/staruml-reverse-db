const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

describe('Application launch', () => {
  let starUml = null;

  beforeEach(() => {
    starUml = new Application({
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
    return starUml.start()
  }, 10000);

  afterEach(() => {
    if (starUml && starUml.isRunning()) {
      return starUml.stop()
    }
  });

  test('shows an initial window', () => {
    return starUml.client.getWindowCount()
        .then(count => {
          assert.equal(count, 1);
          // Please note that getWindowCount() will return 2 if `dev tools` are opened.
          // assert.equal(count, 2)
        })
  });

  test('shows an initial window', () => {
    starUml.mainProcess.argv().then(argv => {
      console.log('main process args: ' + argv);
    });
    return starUml.client.getMainProcessLogs().then(logs => logs.forEach(log => console.log(log)));
  });
});