/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ExtensionUtils = app.getModule("utils/ExtensionUtils");
  var NodeDomain = app.getModule("utils/NodeDomain");


  /**
   * Node Domain for MySQL Client
   * @constructor
   */
  function MySqlNodeDomain(options) {
    NodeDomain.apply(this, ["mySqlDbClient", ExtensionUtils.getModulePath(module, "../../node/MySqlDbClient")]);

    /**
     * All DB Client-related (pg-pool) options
     * @private
     * @member {object}
     */
    this.options = options && {
      user: options.userName,
      password: options.password,
      host: options.server,
      port: options.options.port,
      database: options.options.database || options.userName
    };
  }
  // inherits from NodeDomain
  MySqlNodeDomain.prototype = Object.create(NodeDomain.prototype);
  MySqlNodeDomain.prototype.constructor = MySqlNodeDomain;

  /**
   * Execute SQL statement
   * @param {Request} request
   * @return {$.Promise}
   */
  MySqlNodeDomain.prototype.send = function (request) {
    return this.exec("execStmnt", this.options, request.id, request.sql, request.inputs)
  };

  /**
   * Close all opened connections
   * @return {$.Promise}
   */
  MySqlNodeDomain.prototype.close = function () {
    return this.exec("close");
  };

  module.exports = MySqlNodeDomain;
});