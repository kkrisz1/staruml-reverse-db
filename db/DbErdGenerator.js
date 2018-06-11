/**
 * Analyze all columns of tables and their relationships under the given database
 *
 * @param {Object} options
 * @param {Object} dbAnalyzer
 * @return {$.Promise} jqueryPromise
 */
function analyze(options, dbAnalyzer) {
  var result = new $.Deferred();
  result.notify({severity: "info", message: "ER Data Model generation has been started. Please wait..."});
  setTimeout(() => {
    if (result.state() === "pending") {
      result.notify({severity: "info", message: "ER Data Model generation is in progress... "});
    }
  }, 8000);

  dbAnalyzer.analyze()
      .then(() => {
        result.notify({severity: "info", message: "ER Data Model generation has been finished."});
        result.resolve();
      }, (err) => {
        result.notify({severity: "error", message: "Error occurred!"});
        result.reject(err);
      })
      .always(() => {
        // When StarUML closed or NodeJS server is restarted then all connections are closed
      });

  return result.promise();
}

exports.analyze = analyze;
