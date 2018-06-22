class DbErdGenerator {
  /**
   * @constructor
   * @param options
   * @param dbAnalyzer
   */
  constructor(options, dbAnalyzer) {
    this.options = options;
    this.dbAnalyzer = dbAnalyzer;
  }

  /**
   * Toast notifications
   */
  infoNotification(message) {
    console.info(message);
    app.toast.info(message);
  }

  errorNotification(message) {
    console.error(message);
    app.toast.error(message);
  }

  pendingNotification() {
    this.infoNotification("ER Data Model generation is in progress...");
  }

  /**
   * Analyze all columns of tables and their relationships under the given database
   *
   * @return {Promise} jqueryPromise
   */
  analyze() {
    this.infoNotification("ER Data Model generation has been started. Please wait...");
    return this.dbAnalyzer.analyze()
        .then(() => this.infoNotification("ER Data Model generation has been finished."))
        .catch(err => this.errorNotification("Error occurred: " + err.message));
  }
}

module.exports = DbErdGenerator;
