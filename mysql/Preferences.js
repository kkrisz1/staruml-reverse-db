/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var AppInit = app.getModule("utils/AppInit");
  var PreferenceManager = app.getModule("core/PreferenceManager");

  var preferenceId = "db.mysql";

  var dbPreferences = {
    "mysql.connection": {
      text: "Database Connection",
      type: "Section"
    },
    "mysql.connection.username": {
      text: "Username",
      description: "Username for database connection.",
      type: "String",
      default: ""
    },
    "mysql.connection.password": {
      text: "Password",
      description: "Password for database connection.",
      type: "String",
      default: ""
    },
    "mysql.connection.server": {
      text: "Server IP",
      description: "IP address of the database server.",
      type: "String",
      default: "localhost"
    },
    "mysql.connection.owner": {
      text: "Database Schema",
      description: "Database Schema.",
      type: "String",
      default: "public"
    },
    "mysql.connection.options": {
      text: "Database Connection Options",
      type: "Section"
    },
    "mysql.connection.options.port": {
      text: "Server Port",
      description: "Port number to access the database server.",
      type: "Number",
      default: 3306
    },
    "mysql.connection.options.database": {
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
      userName: PreferenceManager.get("mysql.connection.username"),
      password: PreferenceManager.get("mysql.connection.password"),
      server: PreferenceManager.get("mysql.connection.server"),
      owner: PreferenceManager.get("mysql.connection.owner"),
      options: {
        port: PreferenceManager.get("mysql.connection.options.port"),
        database: PreferenceManager.get("mysql.connection.options.database")
      }
    };
  }

  AppInit.htmlReady(function () {
    PreferenceManager.register(preferenceId, "MySQL Server", dbPreferences);
  });

  exports.getId = getId;
  exports.getConnOptions = getConnOptions;
});
