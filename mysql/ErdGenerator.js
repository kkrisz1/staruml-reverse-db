const DbErdGenerator = require("../db/DbErdGenerator");
const DbAnalyzer = require("./MySqlAnalyzer");

/**
 * Analyze all columns of tables and their relationships under the given database
 *
 * @param {Object} options
 * @param {type.ERDDataModel} model
 * @return {Promise} jqueryPromise
 */
function analyze(options, model) {
  if (!model) {
    const projectManager = app.project;
    model = new type.ERDDataModel();
    model.name = options.options.database + "." + options.owner;
    model._parent = projectManager.getProject() ? projectManager.getProject() : projectManager.newProject();
  }

  return DbErdGenerator.analyze(options, new DbAnalyzer(options, model));
}

exports.analyze = analyze;
