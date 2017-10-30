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

  /**
   * Popup PreferenceDialog with DB Preference Schema
   */
  function _handleMsSqlDbConfigure() {
    CommandManager.execute(Commands.FILE_PREFERENCES, MsSqlDbPreferences.getId());
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

    CoreExtension.findElementByNameIgnoreCase();
    CoreExtension.getTagValue();
  });


  // Register Command;
  CommandManager.register("Database", CMD_DB, CommandManager.doNothing);
  CommandManager.register("MS SQL Server", CMD_DB_MSSQL, CommandManager.doNothing);
  CommandManager.register("Generate ER Data Model...", CMD_DB_MSSQL_GENERATE_ERD, _handleMsSqlErdGen);
  CommandManager.register("Configure Server...", CMD_DB_MSSQL_CONFIGURE, _handleMsSqlDbConfigure);

  // Add menus
  var topMenu =  MenuManager.getMenu(Commands.TOOLS);
  var dbMenuItem = topMenu.addMenuItem(CMD_DB);

  var msSqlSubMenuItem = dbMenuItem.addMenuItem(CMD_DB_MSSQL);
  msSqlSubMenuItem.addMenuItem(CMD_DB_MSSQL_GENERATE_ERD, ["Alt-Shift-M"]);
  msSqlSubMenuItem.addMenuDivider();
  msSqlSubMenuItem.addMenuItem(CMD_DB_MSSQL_CONFIGURE);
});
