/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, appshell, document */
define(function (require, exports, module) {
  "use strict";

  var AppInit = app.getModule("utils/AppInit");
  var Commands = app.getModule("command/Commands");
  var CommandManager = app.getModule("command/CommandManager");
  var MenuManager = app.getModule("menu/MenuManager");
  var Toast = app.getModule("ui/Toast");

  var MsSqlDbPreferences = require("mssql/Preferences");
  var MsSqlErdGenerator = require("mssql/ErdGenerator");

  var PostgreSqlDbPreferences = require("postgresql/Preferences");
  var PostgreSqlErdGenerator = require("postgresql/ErdGenerator");

  var MySqlDbPreferences = require("mysql/Preferences");
  var MySqlErdGenerator = require("mysql/ErdGenerator");

  var MethodPolyfill = require("polyfill/MethodPolyfill");
  var CoreExtension = require("util/CoreExtension");


  /**
   * Commands IDs
   */
  var CMD_DB = "db";

  var CMD_DB_MSSQL = CMD_DB + ".mssql";
  var CMD_DB_MSSQL_CONFIGURE = CMD_DB_MSSQL + ".configure";
  var CMD_DB_MSSQL_GENERATE = CMD_DB_MSSQL + ".generate";
  var CMD_DB_MSSQL_GENERATE_ERD = CMD_DB_MSSQL_GENERATE + ".erd";

  var CMD_DB_POSTGRESQL = CMD_DB + ".postgresql";
  var CMD_DB_POSTGRESQL_CONFIGURE = CMD_DB_POSTGRESQL + ".configure";
  var CMD_DB_POSTGRESQL_GENERATE = CMD_DB_POSTGRESQL + ".generate";
  var CMD_DB_POSTGRESQL_GENERATE_ERD = CMD_DB_POSTGRESQL_GENERATE + ".erd";

  var CMD_DB_MYSQL = CMD_DB + ".mysql";
  var CMD_DB_MYSQL_CONFIGURE = CMD_DB_MYSQL + ".configure";
  var CMD_DB_MYSQL_GENERATE = CMD_DB_MYSQL + ".generate";
  var CMD_DB_MYSQL_GENERATE_ERD = CMD_DB_MYSQL_GENERATE + ".erd";

  /**
   * Command Handler for ER Data Model Generator based on DB schema
   *
   * @return {$.Promise}
   */
  function _handleMsSqlErdGen(options, model) {
    var result = new $.Deferred();
    options = options || MsSqlDbPreferences.getConnOptions();

    MsSqlErdGenerator.analyze(options, model)
        .then(result.resolve, result.reject, _notifyUser);

    return result.promise();
  }

  function _handlePostgreSqlErdGen(options, model) {
    var result = new $.Deferred();
    options = options || PostgreSqlDbPreferences.getConnOptions();

    PostgreSqlErdGenerator.analyze(options, model)
        .then(result.resolve, result.reject, _notifyUser);

    return result.promise();
  }

  function _handleMySqlErdGen(options, model) {
    var result = new $.Deferred();
    options = options || MySqlDbPreferences.getConnOptions();

    MySqlErdGenerator.analyze(options, model)
        .then(result.resolve, result.reject, _notifyUser);

    return result.promise();
  }

  /**
   * Popup PreferenceDialog with DB Preference Schema
   */
  function _handleMsSqlDbConfigure() {
    CommandManager.execute(Commands.FILE_PREFERENCES, MsSqlDbPreferences.getId());
  }

  function _handlePostgreSqlDbConfigure() {
    CommandManager.execute(Commands.FILE_PREFERENCES, PostgreSqlDbPreferences.getId());
  }

  function _handleMySqlDbConfigure() {
    CommandManager.execute(Commands.FILE_PREFERENCES, MySqlDbPreferences.getId());
  }


  function _notifyUser(status) {
    switch (status.severity) {
      case "info": {
        Toast.info(status.message);
        break;
      }
      case "warning": {
        Toast.warning(status.message);
        break;
      }
      case "error": {
        Toast.error(status.message);
        break;
      }
    }
  }


  AppInit.htmlReady(function () {
    MethodPolyfill.repeatString();        // ECMAScript 2015
    MethodPolyfill.stringStartsWith();    // ECMAScript 2015
    MethodPolyfill.findElementInArray();  // ECMAScript 2015
    MethodPolyfill.flattenArray();
    MethodPolyfill.objectAssign();        // ECMAScript 2015

    CoreExtension.findElementByNameIgnoreCase();
    CoreExtension.getTagValue();
  });


  // Register Command;
  CommandManager.register("Database", CMD_DB, CommandManager.doNothing);

  CommandManager.register("MS SQL Server", CMD_DB_MSSQL, CommandManager.doNothing);
  CommandManager.register("Generate ER Data Model...", CMD_DB_MSSQL_GENERATE_ERD, _handleMsSqlErdGen);
  CommandManager.register("Configure Server...", CMD_DB_MSSQL_CONFIGURE, _handleMsSqlDbConfigure);

  CommandManager.register("PostgreSQL Server", CMD_DB_POSTGRESQL, CommandManager.doNothing);
  CommandManager.register("Generate ER Data Model...", CMD_DB_POSTGRESQL_GENERATE_ERD, _handlePostgreSqlErdGen);
  CommandManager.register("Configure Server...", CMD_DB_POSTGRESQL_CONFIGURE, _handlePostgreSqlDbConfigure);

  CommandManager.register("MySQL Server", CMD_DB_MYSQL, CommandManager.doNothing);
  CommandManager.register("Generate ER Data Model...", CMD_DB_MYSQL_GENERATE_ERD, _handleMySqlErdGen);
  CommandManager.register("Configure Server...", CMD_DB_MYSQL_CONFIGURE, _handleMySqlDbConfigure);

  // Add menus
  var topMenu = MenuManager.getMenu(Commands.TOOLS);
  var dbMenuItem = topMenu.addMenuItem(CMD_DB);

  var msSqlSubMenuItem = dbMenuItem.addMenuItem(CMD_DB_MSSQL);
  msSqlSubMenuItem.addMenuItem(CMD_DB_MSSQL_GENERATE_ERD, ["Alt-Shift-M"]);
  msSqlSubMenuItem.addMenuDivider();
  msSqlSubMenuItem.addMenuItem(CMD_DB_MSSQL_CONFIGURE);

  var postgreSqlSubMenuItem = dbMenuItem.addMenuItem(CMD_DB_POSTGRESQL);
  postgreSqlSubMenuItem.addMenuItem(CMD_DB_POSTGRESQL_GENERATE_ERD, ["Alt-Shift-L"]);
  postgreSqlSubMenuItem.addMenuDivider();
  postgreSqlSubMenuItem.addMenuItem(CMD_DB_POSTGRESQL_CONFIGURE);

  var mySqlSubMenuItem = dbMenuItem.addMenuItem(CMD_DB_MYSQL);
  mySqlSubMenuItem.addMenuItem(CMD_DB_MYSQL_GENERATE_ERD, ["Alt-Shift-P"]);
  mySqlSubMenuItem.addMenuDivider();
  mySqlSubMenuItem.addMenuItem(CMD_DB_MYSQL_CONFIGURE);
});
