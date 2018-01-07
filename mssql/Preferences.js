/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var AppInit = app.getModule("utils/AppInit");
  var PreferenceManager = app.getModule("core/PreferenceManager");

  var preferenceId = "db.mssql";

  var dbPreferences = {
    "mssql.connection": {
      text: "Database Connection",
      type: "Section"
    },
    "mssql.connection.username": {
      text: "Username",
      description: "Username for database connection.",
      type: "String",
      default: ""
    },
    "mssql.connection.password": {
      text: "Password",
      description: "Password for database connection.",
      type: "String",
      default: ""
    },
    "mssql.connection.server": {
      text: "Server IP",
      description: "IP address of the database server.",
      type: "String",
      default: ""
    },
    "mssql.connection.owner": {
      text: "Database Schema Owner",
      description: "Database Schema Owner.",
      type: "String",
      default: ""
    },
    "mssql.connection.options": {
      text: "Database Connection Options",
      type: "Section"
    },
    "mssql.connection.options.port": {
      text: "Server Port",
      description: "Port number to access the database server.",
      type: "Number",
      default: 1433
    },
    "mssql.connection.options.database": {
      text: "Database",
      description: "Database.",
      type: "String",
      default: ""
    },
    "mssql.dev.options": {
      text: "Development Options (DO NOT CHANGE THEM)",
      type: "Section"
    },
    "mssql.dev.options.useColumnNames": {
      text: "Return row a key-value pair collection",
      description: "A boolean, that when true return rows as key-value collections else as an array.",
      type: "Check",
      default: true
    },
    "mssql.dev.options.rowCollectionOnDone": {
      text: "Return rows as a collection on request done",
      description: "A boolean, that when true will expose received rows in Requests' done* events.",
      type: "Check",
      default: false
    },
    "mssql.dev.options.rowCollectionOnRequestCompletion": {
      text: "Return rows as a collection on request completion",
      description: "A boolean, that when true will expose received rows in Requests' completion callback.",
      type: "Check",
      default: false
    }
  };

  function getId() {
    return preferenceId;
  }

  function getConnOptions() {
    return {
      userName: PreferenceManager.get("mssql.connection.username"),
      password: PreferenceManager.get("mssql.connection.password"),
      server: PreferenceManager.get("mssql.connection.server"),
      owner: PreferenceManager.get("mssql.connection.owner"),
      options: {
        port: PreferenceManager.get("mssql.connection.options.port"),
        database: PreferenceManager.get("mssql.connection.options.database"),
        useColumnNames: PreferenceManager.get("mssql.dev.options.useColumnNames"),
        rowCollectionOnDone: PreferenceManager.get("mssql.dev.options.rowCollectionOnDone"),
        rowCollectionOnRequestCompletion: PreferenceManager.get("mssql.dev.options.rowCollectionOnRequestCompletion")
      }
    };
  }

  AppInit.htmlReady(function () {
    PreferenceManager.register(preferenceId, "MS SQL Server", dbPreferences);
  });

  exports.getId = getId;
  exports.getConnOptions = getConnOptions;
});
