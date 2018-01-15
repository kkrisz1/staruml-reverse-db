/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var DbManager = require("db/DbManager");
  var MySqlNodeDomain = require("util/node/MySqlNodeDomain");

  /**
   * MySqlManager
   * @constructor
   * @param {object} options
   */
  function MySqlManager(options) {
    DbManager.apply(this, [new MySqlNodeDomain(options)]);
  }

  // inherits from DbPreferences
  MySqlManager.prototype = Object.create(DbManager.prototype);
  MySqlManager.prototype.constructor = MySqlManager;

  module.exports = MySqlManager;
});
