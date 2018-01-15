/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ProjectManager = app.getModule("engine/ProjectManager");

  var DbErdGenerator = require("db/DbErdGenerator");
  var DbAnalyzer = require("postgresql/PostgreSqlAnalyzer");

  /**
   * Analyze all columns of tables and their relationships under the given database
   * @param {Object} options
   * @param {type.ERDDataModel} model
   * @return {$.Promise} jqueryPromise
   */
  function analyze(options, model) {
    if (!model) {
      model = new type.ERDDataModel();
      model.name = options.options.database + "." + options.owner;
      model._parent = ProjectManager.getProject() ? ProjectManager.getProject() : ProjectManager.newProject();
    }

    return DbErdGenerator.analyze(options, new DbAnalyzer(options, model));
  }

  exports.analyze = analyze;
});
