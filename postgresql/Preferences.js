/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var AppInit = app.getModule("utils/AppInit");
  var PreferenceManager = app.getModule("core/PreferenceManager");

  var preferenceId = "db.postgresql";

  var dbPreferences = {
    "postgresql.connection": {
      text: "Database Connection",
      type: "Section"
    },
    "postgresql.connection.username": {
      text: "Username",
      description: "Username for database connection.",
      type: "String",
      default: ""
    },
    "postgresql.connection.password": {
      text: "Password",
      description: "Password for database connection.",
      type: "String",
      default: ""
    },
    "postgresql.connection.server": {
      text: "Server IP",
      description: "IP address of the database server.",
      type: "String",
      default: ""
    },
    "postgresql.connection.owner": {
      text: "Database Schema",
      description: "Database Schema.",
      type: "String",
      default: "public"
    },
    "postgresql.connection.options": {
      text: "Database Connection Options",
      type: "Section"
    },
    "postgresql.connection.options.port": {
      text: "Server Port",
      description: "Port number to access the database server.",
      type: "Number",
      default: 5432
    },
    "postgresql.connection.options.database": {
      text: "Database",
      description: "Database.",
      type: "String",
      default: ""
    }
  };

  function getId() {
    return preferenceId;
  }

  function getConnOptions() {
    return {
      userName: PreferenceManager.get("postgresql.connection.username"),
      password: PreferenceManager.get("postgresql.connection.password"),
      server: PreferenceManager.get("postgresql.connection.server"),
      owner: PreferenceManager.get("postgresql.connection.owner"),
      options: {
        port: PreferenceManager.get("postgresql.connection.options.port"),
        database: PreferenceManager.get("postgresql.connection.options.database")
      }
    };
  }

  AppInit.htmlReady(function () {
    PreferenceManager.register(preferenceId, "PostgreSQL Server", dbPreferences);
  });

  exports.getId = getId;
  exports.getConnOptions = getConnOptions;
});
