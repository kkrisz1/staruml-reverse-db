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
 * Toast notifications
 */
const startedNotification = () => app.toast.info("ER Data Model generation has been started. Please wait...");
const pendingNotification = () => app.toast.info("ER Data Model generation is in progress...");
const finishedNotification = () => app.toast.info("ER Data Model generation has been finished.");
const errorNotification = err => app.toast.error("Error occurred: " + err.message);
/**
 * Popup PreferenceDialog with DB Preference Schema
 */
const appPreference = "application:preferences";
const _handleMsSqlDbConfigure = () => app.commands.execute(appPreference, msSqlDbPrefs.getId());
const _handlePostgreSqlDbConfigure = () => app.commands.execute(appPreference, postgreSqlDbPrefs.getId());
const _handleMySqlDbConfigure = () => app.commands.execute(appPreference, mySqlDbPrefs.getId());

/**
 * Command Handler for ER Data Model Generator based on DB schema
 *
 * @return {Promise}
 */
function _handleMsSqlErdGen(options, model) {
  options = options || msSqlDbPrefs.getConnOptions();

  startedNotification();
  return MsSqlErdGenerator.analyze(options, model)
      .then(finishedNotification)
      .catch(errorNotification);
}

function _handlePostgreSqlErdGen(options, model) {
  options = options || postgreSqlDbPrefs.getConnOptions();

  startedNotification();
  return PostgreSqlErdGenerator.analyze(options, model)
      .then(finishedNotification)
      .catch(errorNotification);
}

function _handleMySqlErdGen(options, model) {
  options = options || mySqlDbPrefs.getConnOptions();

  startedNotification();
  return MySqlErdGenerator.analyze(options, model)
      .then(finishedNotification)
      .catch(errorNotification);
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