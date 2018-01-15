/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var DbPreferences = require("db/DbPreferences");

  /**
   * MySqlPreferences
   * @constructor
   */
  function MySqlPreferences() {
    DbPreferences.apply(this, ["MySQL Server", "db.mysql"]);

    this.dbPreferences[this.connPrefKeyPrefix + ".owner"].default = "";
    this.dbPreferences[this.connPrefOptKeyPrefix + ".database"].default = "def";
    this.dbPreferences[this.connPrefOptKeyPrefix + ".port"].default = 3306;

    this._register();
  }

  // inherits from DbPreferences
  MySqlPreferences.prototype = Object.create(DbPreferences.prototype);
  MySqlPreferences.prototype.constructor = MySqlPreferences;

  module.exports = MySqlPreferences;
});
