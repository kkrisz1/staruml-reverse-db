/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var ExtensionUtils = app.getModule("utils/ExtensionUtils");

  var DbNodeDomain = require("util/node/DbNodeDomain");


  /**
   * Node Domain for MySQL Client
   * @constructor
   */
  function MySqlNodeDomain(options) {
    DbNodeDomain.apply(this, ["mySqlDbClient",
      ExtensionUtils.getModulePath(module, "../../node/MySqlDbClient"),
      options && {
        user: options.userName,
        password: options.password,
        host: options.server,
        port: options.options.port,
        database: options.options.database || options.userName
      }]);
  }

  // inherits from DbNodeDomain
  MySqlNodeDomain.prototype = Object.create(DbNodeDomain.prototype);
  MySqlNodeDomain.prototype.constructor = MySqlNodeDomain;

  module.exports = MySqlNodeDomain;
});