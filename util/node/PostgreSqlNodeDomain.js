/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ExtensionUtils = app.getModule("utils/ExtensionUtils");
  var NodeDomain = app.getModule("utils/NodeDomain");


  /**
   * Node Domain for PostgreSQL Client
   * @constructor
   */
  function PostgreSqlNodeDomain(options) {
    NodeDomain.apply(this, ["postgreSqlDbClient", ExtensionUtils.getModulePath(module, "../../node/PostgreSqlDbClient")]);

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
  PostgreSqlNodeDomain.prototype = Object.create(NodeDomain.prototype);
  PostgreSqlNodeDomain.prototype.constructor = PostgreSqlNodeDomain;

  /**
   * Execute SQL statement
   * @param {Request} request
   * @return {$.Promise}
   */
  PostgreSqlNodeDomain.prototype.send = function (request) {
    return this.exec("execStmnt", this.options, request.id, request.sql, request.inputs)
  };

  /**
   * Close all opened connections
   * @return {$.Promise}
   */
  PostgreSqlNodeDomain.prototype.close = function () {
    return this.exec("close");
  };

  module.exports = PostgreSqlNodeDomain;
});