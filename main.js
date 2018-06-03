const MsSqlDbPreferences = require("./mssql/MsSqlPreferences");
const msSqlDbPrefs = new MsSqlDbPreferences();
const MsSqlErdGenerator = require("./mssql/ErdGenerator");

const PostgreSqlDbPreferences = require("./postgresql/PostgreSqlPreferences");
const postgreSqlDbPrefs = new PostgreSqlDbPreferences();
const PostgreSqlErdGenerator = require("./postgresql/ErdGenerator");

const MySqlDbPreferences = require("./mysql/MySqlPreferences");
const mySqlDbPrefs = new MySqlDbPreferences();
const MySqlErdGenerator = require("./mysql/ErdGenerator");

const MethodPolyfill = require("./polyfill/MethodPolyfill");
const CoreExtension = require("./util/CoreExtension");

/**
 * Command Handler for ER Data Model Generator based on DB schema
 *
 * @return {$.Promise}
 */
function _handleMsSqlErdGen(options, model) {
  let result = new $.Deferred();
  options = options || msSqlDbPrefs.getConnOptions();

  MsSqlErdGenerator.analyze(options, model)
      .then(result.resolve, result.reject, _notifyUser);
//
  return result.promise();
}

function _handlePostgreSqlErdGen(options, model) {
  let result = new $.Deferred();
  options = options || postgreSqlDbPrefs.getConnOptions();

  PostgreSqlErdGenerator.analyze(options, model)
      .then(result.resolve, result.reject, _notifyUser);

  return result.promise();
}

function _handleMySqlErdGen(options, model) {
  let result = new $.Deferred();
  options = options || mySqlDbPrefs.getConnOptions();

  MySqlErdGenerator.analyze(options, model)
      .then(result.resolve, result.reject, _notifyUser);

  return result.promise();
}

/**
 * Popup PreferenceDialog with DB Preference Schema
 */
function _handleMsSqlDbConfigure() {
  app.commands.execute("application:preferences", msSqlDbPrefs.getId());
}

function _handlePostgreSqlDbConfigure() {
  app.commands.execute("application:preferences", postgreSqlDbPrefs.getId());
}

function _handleMySqlDbConfigure() {
  app.commands.execute("application:preferences", mySqlDbPrefs.getId());
}


function _notifyUser(status) {
  switch (status.severity) {
    case "info": {
      app.toast.info(status.message);
      break;
    }
    case "warning": {
      app.toast.warning(status.message);
      break;
    }
    case "error": {
      app.toast.error(status.message);
      break;
    }
  }
}

function init() {
  MethodPolyfill.flattenArray();

  CoreExtension.findElementByNameIgnoreCase();
  CoreExtension.getTagValue();

  app.commands.register("reverse-db-mssql:generate-erd", _handleMsSqlErdGen);
  app.commands.register("reverse-db-mssql:configure", _handleMsSqlDbConfigure);
  app.commands.register("reverse-db-mysql:generate-erd", _handleMySqlErdGen);
  app.commands.register("reverse-db-mysql:configure", _handleMySqlDbConfigure);
  app.commands.register("reverse-db-postgresql:generate-erd", _handlePostgreSqlErdGen);
  app.commands.register("reverse-db-postgresql:configure", _handlePostgreSqlDbConfigure);
}

exports.init = init;