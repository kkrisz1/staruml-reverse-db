/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ExtensionUtils = app.getModule("utils/ExtensionUtils");

  var DbNodeDomain = require("util/node/DbNodeDomain");


  /**
   * Node Domain for PostgreSQL Client
   * @constructor
   */
  function PostgreSqlNodeDomain(options) {
    DbNodeDomain.apply(this, ["postgreSqlDbClient",
      ExtensionUtils.getModulePath(module, "../../node/PostgreSqlDbClient"),
      options && {
        user: options.userName,
        password: options.password,
        host: options.server,
        port: options.options.port,
        database: options.options.database || options.userName
      }]);
  }

  // inherits from DbNodeDomain
  PostgreSqlNodeDomain.prototype = Object.create(DbNodeDomain.prototype);
  PostgreSqlNodeDomain.prototype.constructor = PostgreSqlNodeDomain;

  module.exports = PostgreSqlNodeDomain;
});