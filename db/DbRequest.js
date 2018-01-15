/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var IdGenerator = app.getModule("core/IdGenerator");

  /**
   * DbRequest
   * @constructor
   * @param {string} sql
   * @param {Array.<RequestInput>} inputs
   */
  function DbRequest(sql, inputs) {
    /**
     * @member {string}
     */
    this.id = IdGenerator.generateGuid();

    /**
     * @member {string}
     */
    this.sql = sql;

    /**
     * @member {Array.<RequestInput>}
     */
    this.inputs = inputs;
  }

  module.exports = DbRequest;
});
