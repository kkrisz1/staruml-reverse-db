/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var DbPreferences = require("db/DbPreferences");
  var PreferenceManager = app.getModule("core/PreferenceManager");

  /**
   * MsSqlPreferences
   * @constructor
   */
  function MsSqlPreferences() {
    DbPreferences.apply(this, ["MS SQL Server", "db.mssql"]);

    this.dbPreferences[this.connPrefKeyPrefix + ".owner"].default = "";
    this.dbPreferences[this.connPrefOptKeyPrefix + ".port"].default = 1433;
    this.dbPreferences[this.connPrefKeyPrefix + ".dev.options"] = {
      text: "Development Options (DO NOT CHANGE THEM)",
      type: "Section"
    };
    this.dbPreferences[this.connPrefKeyPrefix + ".dev.options.useColumnNames"] = {
      text: "Return row a key-value pair collection",
      description: "A boolean, that when true return rows as key-value collections else as an array.",
      type: "Check",
      default: true
    };
    this.dbPreferences[this.connPrefKeyPrefix + ".dev.options.rowCollectionOnDone"] = {
      text: "Return rows as a collection on request done",
      description: "A boolean, that when true will expose received rows in Requests' done* events.",
      type: "Check",
      default: false
    };
    this.dbPreferences[this.connPrefKeyPrefix + ".dev.options.rowCollectionOnRequestCompletion"] = {
      text: "Return rows as a collection on request completion",
      description: "A boolean, that when true will expose received rows in Requests' completion callback.",
      type: "Check",
      default: false
    };

    this._register();
  }

  // inherits from DbPreferences
  MsSqlPreferences.prototype = Object.create(DbPreferences.prototype);
  MsSqlPreferences.prototype.constructor = MsSqlPreferences;

  /**
   * Connection options
   * @return {object}
   */
  // DbPreferences.prototype.getConnOptions = function () {
  //   var self = this;
  //
  //   return Object.assign(self.getConnOptions(), {
  //     options: {
  //       useColumnNames: PreferenceManager.get("mssql.dev.options.useColumnNames"),
  //       rowCollectionOnDone: PreferenceManager.get("mssql.dev.options.rowCollectionOnDone"),
  //       rowCollectionOnRequestCompletion: PreferenceManager.get("mssql.dev.options.rowCollectionOnRequestCompletion")
  //     }
  //   });
  // };

  module.exports = MsSqlPreferences;
});
