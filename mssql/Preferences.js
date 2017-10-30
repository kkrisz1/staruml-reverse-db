/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var AppInit = app.getModule("utils/AppInit");
  var PreferenceManager = app.getModule("core/PreferenceManager");

  var preferenceId = "db.mssql";

  var dbPreferences = {
    "db.connection": {
      text: "Database Connection",
      type: "Section"
    },
    "db.connection.username": {
      text: "Username",
      description: "Username for database connection.",
      type: "String",
      default: ""
    },
    "db.connection.password": {
      text: "Password",
      description: "Password for database connection.",
      type: "String",
      default: ""
    },
    "db.connection.server": {
      text: "Server IP",
      description: "IP address of the database server.",
      type: "String",
      default: ""
    },
    "db.connection.owner": {
      text: "Database Schema Owner",
      description: "Database Schema Owner.",
      type: "String",
      default: ""
    },
    "db.connection.options": {
      text: "Database Connection Options",
      type: "Section"
    },
    "db.connection.options.port": {
      text: "Server Port",
      description: "Port number to access he database server.",
      type: "Number",
      default: 1433
    },
    "db.connection.options.database": {
      text: "Database",
      description: "Database.",
      type: "String",
      default: ""
    },
    "db.dev.options": {
      text: "Development Options (DO NOT CHANGE THEM)",
      type: "Section"
    },
    "db.dev.options.useColumnNames": {
      text: "Return row a key-value pair collection",
      description: "A boolean, that when true return rows as key-value collections else as an array.",
      type: "Check",
      default: true
    },
    "db.dev.options.rowCollectionOnDone": {
      text: "Return rows as a collection on request done",
      description: "A boolean, that when true will expose received rows in Requests' done* events.",
      type: "Check",
      default: false
    },
    "db.dev.options.rowCollectionOnRequestCompletion": {
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
      userName: PreferenceManager.get("db.connection.username"),
      password: PreferenceManager.get("db.connection.password"),
      server: PreferenceManager.get("db.connection.server"),
      owner: PreferenceManager.get("db.connection.owner"),
      options: {
        port: PreferenceManager.get("db.connection.options.port"),
        database: PreferenceManager.get("db.connection.options.database"),
        useColumnNames: PreferenceManager.get("db.dev.options.useColumnNames"),
        rowCollectionOnDone: PreferenceManager.get("db.dev.options.rowCollectionOnDone"),
        rowCollectionOnRequestCompletion: PreferenceManager.get("db.dev.options.rowCollectionOnRequestCompletion")
      }
    };
  }

  AppInit.htmlReady(function () {
    PreferenceManager.register(preferenceId, "MS SQL Server", dbPreferences);
  });

  exports.getId = getId;
  exports.getConnOptions = getConnOptions;
});
