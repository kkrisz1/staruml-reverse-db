class Notifier {
    /**
     * Notifier
     *
     * @constructor
     */
    constructor(command) {
        this._done = false;
        this._command = command;
    }

    start() {
        app.toast.info("ER Data Model generation has been started. Please wait...");
        this.pending();
    }

    pending() {
        if (this._done) return;
        app.toast.info("ER Data Model generation is in progress...");
        setTimeout(this.pendingNotification, 2000, this._done);
    }

    finish() {
        app.toast.info("ER Data Model generation has been finished.");
        this._done = true;
    }

    error(err) {
        app.toast.error("Error occurred: " + err.message);
        this._done = true;
    }

}

module.exports = Notifier;
