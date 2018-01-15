/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var DbPreferences = require("db/DbPreferences");

  /**
   * PostgreSqlPreferences
   * @constructor
   */
  function PostgreSqlPreferences() {
    DbPreferences.apply(this, ["PostgreSQL Server", "db.postgresql"]);

    this.dbPreferences[this.connPrefKeyPrefix + ".owner"].default = "public";
    this.dbPreferences[this.connPrefOptKeyPrefix + ".port"].default = 5432;

    this._register();
  }

  // inherits from DbPreferences
  PostgreSqlPreferences.prototype = Object.create(DbPreferences.prototype);
  PostgreSqlPreferences.prototype.constructor = PostgreSqlPreferences;

  module.exports = PostgreSqlPreferences;
});
