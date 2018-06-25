const MsSqlDbPreferences = require("./mssql/MsSqlPreferences");
const msSqlDbPrefs = new MsSqlDbPreferences();
const MsSqlErdGenerator = require("./mssql/MsSqlErdGenerator");

const PostgreSqlDbPreferences = require("./postgresql/PostgreSqlPreferences");
const postgreSqlDbPrefs = new PostgreSqlDbPreferences();
const PostgreSqlErdGenerator = require("./postgresql/PostgreSqlErdGenerator");

const MySqlDbPreferences = require("./mysql/MySqlPreferences");
const mySqlDbPrefs = new MySqlDbPreferences();
const MySqlErdGenerator = require("./mysql/MySqlErdGenerator");

const MethodPolyfill = require("./polyfill/MethodPolyfill");
const CoreExtension = require("./util/CoreExtension");

/**
 * Popup PreferenceDialog with DB Preference Schema
 */
const appPreference = "application:preferences";
const _handleMsSqlDbConfigure = () => app.commands.execute(appPreference, msSqlDbPrefs.getId());
const _handlePostgreSqlDbConfigure = () => app.commands.execute(appPreference, postgreSqlDbPrefs.getId());
const _handleMySqlDbConfigure = () => app.commands.execute(appPreference, mySqlDbPrefs.getId());

const _createModel = options => {
  const projectManager = app.project;
  const project = projectManager.getProject() ? projectManager.getProject() : projectManager.newProject();
  // model = app.factory.createModel({
  //   id: "ERDDataModel",
  //   parent: project,
  //   modelInitializer: elem => elem.name = options.options.database + "." + options.owner
  // });
  let model = new type.ERDDataModel();
  model._parent = project;
  model.name = options.options.database + "." + options.owner;

  return model;
};

const _updateModel = (command, options, model) => {
  app.elementPickerDialog.showDialog('Select an ER data model', null, type.ERDDataModel)
      .then(({buttonId, returnValue}) => {
        if (buttonId === "ok") {
          const msg = "Update of ER Data Model has not been implemented yet.";
          console.warn(msg);
          app.toast.warning(msg);
          // return command(options, returnValue || model);
        }
      });
};

/**
 * Command Handler for ER Data Model Generator based on DB schema
 *
 * @return {Promise}
 */
function _handleMsSqlErdGen(options, model) {
  options = options || msSqlDbPrefs.getConnOptions();
  model = model || _createModel(options);

  return new MsSqlErdGenerator(options, model).analyze();
}

function _handlePostgreSqlErdGen(options, model) {
  options = options || postgreSqlDbPrefs.getConnOptions();
  model = model || _createModel(options);

  return new PostgreSqlErdGenerator(options, model).analyze();
}

function _handleMySqlErdGen(options, model) {
  options = options || mySqlDbPrefs.getConnOptions();
  model = model || _createModel(options);

  return new MySqlErdGenerator(options, model).analyze();
}

function _handleMySqlErdUpdate(options, model) {
  return _updateModel(_handleMySqlErdGen, options, model);
}

function init() {
  MethodPolyfill.flattenArray();

  CoreExtension.findElementByNameIgnoreCase();
  CoreExtension.getTagValue();

  app.commands.register("reverse-db-mssql:generate-erd", _handleMsSqlErdGen);
  app.commands.register("reverse-db-mssql:configure", _handleMsSqlDbConfigure);
  app.commands.register("reverse-db-mysql:generate-erd", _handleMySqlErdGen);
  // app.commands.register("reverse-db-mysql:update-erd", _handleMySqlErdUpdate);
  app.commands.register("reverse-db-mysql:configure", _handleMySqlDbConfigure);
  app.commands.register("reverse-db-postgresql:generate-erd", _handlePostgreSqlErdGen);
  app.commands.register("reverse-db-postgresql:configure", _handlePostgreSqlDbConfigure);
}

exports.init = init;