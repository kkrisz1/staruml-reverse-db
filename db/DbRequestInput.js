/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  /**
   * DbRequestInput
   * @constructor
   * @param {string} name
   * @param {string} type
   * @param {string} value
   */
  function DbRequestInput(name, type, value) {
    /**
     * @private
     * @member {string}
     */
    this.name = name;

    /**
     * @private
     * @member {string}
     */
    this.type = type;

    /**
     * @private
     * @member {string}
     */
    this.value = value;
  }


  module.exports = DbRequestInput;
});
