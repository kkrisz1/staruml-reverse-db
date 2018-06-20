const DbErdGenerator = require("../db/DbErdGenerator");
const DbAnalyzer = require("./PostgreSqlAnalyzer");

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
    const project = projectManager.getProject() ? projectManager.getProject() : projectManager.newProject();
    model = app.factory.createModel({
      id: "ERDDataModel",
      parent: project,
      modelInitializer: elem => elem.name = options.options.database + "." + options.owner
    });
    // model = new type.ERDDataModel();
    // model.name = options.options.database + "." + options.owner;
    // model._parent = project;
  }

  return DbErdGenerator.analyze(options, new DbAnalyzer(options, model));
}

exports.analyze = analyze;
