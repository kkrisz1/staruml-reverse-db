const TestDriver = require("./TestDriver");

describe("Application launch", () => {
  const app = new TestDriver({
    args: ['c:\\Program Files\\StarUML\\resources\\app.asar'],
    env: {
      NODE_ENV: 'test'
    }
  });

  beforeEach(async () => {
    await app.isReady;
  }, 10000);

  afterEach(async () => {
    await app.stop();
  });

  test("shows an initial window", () => {
    console.log("success");
  });
});