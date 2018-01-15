/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var DbManager = require("db/DbManager");
  var MsSqlNodeDomain = require("util/node/MsSqlNodeDomain");

  /**
   * MsSqlManager
   * @constructor
   * @param {object} options
   */
  function MsSqlManager(options) {
    DbManager.apply(this, [new MsSqlNodeDomain(options)]);
  }

  // inherits from DbPreferences
  MsSqlManager.prototype = Object.create(DbManager.prototype);
  MsSqlManager.prototype.constructor = MsSqlManager;

  module.exports = MsSqlManager;
});
