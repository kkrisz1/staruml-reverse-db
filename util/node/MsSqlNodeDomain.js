/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ExtensionUtils = app.getModule("utils/ExtensionUtils");
  var NodeDomain = app.getModule("utils/NodeDomain");


  /**
   * Node Domain for MS SQL Client
   * @constructor
   */
  function MsSqlNodeDomain(options) {
    NodeDomain.apply(this, ["msSqlDbClient", ExtensionUtils.getModulePath(module, "../../node/MsSqlDbClient")]);

    /**
     * All DB Client-related (tedious) options
     * @private
     * @member {object}
     */
    this.options = options;
  }
  // inherits from NodeDomain
  MsSqlNodeDomain.prototype = Object.create(NodeDomain.prototype);
  MsSqlNodeDomain.prototype.constructor = MsSqlNodeDomain;

  /**
   * Execute SQL statement
   * @param {Request} request
   * @return {$.Promise}
   */
  MsSqlNodeDomain.prototype.send = function (request) {
    return this.exec("execStmnt", this.options, request.id, request.sql, request.inputs)
  };

  /**
   * Close all opened connections
   * @return {$.Promise}
   */
  MsSqlNodeDomain.prototype.close = function () {
    return this.exec("close");
  };

  module.exports = MsSqlNodeDomain;
});