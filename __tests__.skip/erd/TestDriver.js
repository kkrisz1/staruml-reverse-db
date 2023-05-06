const electronPath = require("electron"); // Require Electron from the binaries included in node_modules.
const childProcess = require('child_process');

class TestDriver {
    constructor({args, env}) {
        this.rpcCalls = [];

        // start child process
        // env.APP_TEST_DRIVER = 1; // let the app know it should listen for messages
        this.process = childProcess.spawn(electronPath, args, {stdio: ['inherit', 'inherit', 'inherit', 'ipc'], env});

        // handle rpc responses
        this.process.on('message', (message) => {
            // pop the handler
            const rpcCall = this.rpcCalls[message.msgId];
            if (!rpcCall) {
                return;
            }

            this.rpcCalls[message.msgId] = null;
            // reject/resolve
            if (message.reject) {
                rpcCall.reject(message.reject);
            } else {
                rpcCall.resolve(message.resolve);
            }
        });

        // wait for ready
        this.isReady = this.rpc('isReady')
            .then(() => console.log("App is ready"))
            .catch((err) => {
                console.error('Application failed to start', err);
                this.stop();
                process.exit(1);
            });
    }

    // simple RPC call
    // to use: driver.rpc('method', 1, 2, 3).then(...)
    async rpc(cmd, ...args) {
        // send rpc request
        const msgId = this.rpcCalls.length;
        this.process.send({msgId, cmd, args});
        return new Promise((resolve, reject) => this.rpcCalls.push({resolve, reject}));
    }

    stop() {
        this.process.kill();
    }
}

module.exports = TestDriver;
