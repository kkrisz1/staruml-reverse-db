/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var NodeDomain = app.getModule("utils/NodeDomain");


  /**
   * Node Domain for DB Clients
   * @constructor
   */
  function DbNodeDomain(domainName, clientPath, options) {
    NodeDomain.apply(this, [domainName, clientPath]);

    /**
     * All DB Client-related options
     * @private
     * @member {object}
     */
    this.options = options;
  }

  // inherits from NodeDomain
  DbNodeDomain.prototype = Object.create(NodeDomain.prototype);
  DbNodeDomain.prototype.constructor = DbNodeDomain;

  /**
   * Execute SQL statement
   * @param {Request} request
   * @return {$.Promise}
   */
  DbNodeDomain.prototype.send = function (request) {
    return this.exec("execStmnt", this.options, request.id, request.sql, request.inputs)
  };

  /**
   * Close all opened connections
   * @return {$.Promise}
   */
  DbNodeDomain.prototype.close = function () {
    return this.exec("close");
  };

  module.exports = DbNodeDomain;
});