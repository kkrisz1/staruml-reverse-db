/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ExtensionUtils = app.getModule("utils/ExtensionUtils");

  var DbNodeDomain = require("util/node/DbNodeDomain");


  /**
   * Node Domain for MS SQL Client
   * @constructor
   */
  function MsSqlNodeDomain(options) {
    DbNodeDomain.apply(this, ["msSqlDbClient",
      ExtensionUtils.getModulePath(module, "../../node/MsSqlDbClient"),
      options]);

    /**
     * All DB Client-related (tedious) options
     * @private
     * @member {object}
     */
    this.options = options;
  }

  // inherits from DbNodeDomain
  MsSqlNodeDomain.prototype = Object.create(DbNodeDomain.prototype);
  MsSqlNodeDomain.prototype.constructor = MsSqlNodeDomain;

  module.exports = MsSqlNodeDomain;
});