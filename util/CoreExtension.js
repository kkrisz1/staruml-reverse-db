/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var Core = app.getModule("core/Core");
  var Element = Core.Element;
  var ExtensibleModel = Core.ExtensibleModel;


  function findElementByNameIgnoreCase() {
    if (Element.prototype.findByNameIgnoreCase) {
      return;
    }

    /**
     * Find by name (ignore case) in children
     *
     * @param {string} name
     * @return {Element}
     */
    Element.prototype.findByNameIgnoreCase = function (name) {
      "use strict";

      return this.getChildren().find(function (child) {
        return child.name.toUpperCase() === name.toUpperCase();
      });
    };
  }

  function getTagValue() {
    /**
     * Return value of a specific tag
     *
     * @param {string} tagName
     * @param {Function} getValue
     * @return {string|boolean|reference|number|undefined}
     */
    ExtensibleModel.prototype.getTagValue = function (tagName, getValue) {
      for (var i = 0, len = this.tags.length; i < len; i++) {
        var tag = this.tags[i];
        if (tag.name === tagName) {
          return getValue ? getValue(tag) : tag.value;
        }
      }
      return undefined;
    };
  }

  exports.findElementByNameIgnoreCase = findElementByNameIgnoreCase;
  exports.getTagValue = getTagValue;
});
