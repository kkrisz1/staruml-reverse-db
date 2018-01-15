/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ProjectManager = app.getModule("engine/ProjectManager");

  var DbAnalyzer = require("postgresql/PostgreSqlAnalyzer");

  /**
   * Analyze all columns of tables and their relationships under the given database
   * @param {Object} options
   * @param {type.ERDDataModel} model
   * @return {$.Promise} jqueryPromise
   */
  function analyze(options, model) {
    var result = new $.Deferred();
    result.notify({severity: "info", message: "ER Data Model generation has been started. Please wait..."});
    setTimeout(function () {
      if (result.state() === "pending") {
        result.notify({severity: "info", message: "ER Data Model generation is in progress... "});
      }
    }, 8000);

    if (!model) {
      model = new type.ERDDataModel();
      model._parent = ProjectManager.getProject() ? ProjectManager.getProject() : ProjectManager.newProject();
    }
    var dbAnalyzer = new DbAnalyzer(options, model);
    dbAnalyzer.analyze()
        .then(function () {
          result.notify({severity: "info", message: "ER Data Model generation has been finished."});
          result.resolve();
        }, function (err) {
          result.notify({severity: "error", message: "Error occurred!"});
          result.reject(err);
        })
        .always(function () {
          // When StarUML closed or NodeJS server is restarted then all connections are closed
        });

    return result.promise();
  }

  exports.analyze = analyze;
});
