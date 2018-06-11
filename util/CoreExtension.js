const Core = require(app.getAppPath() + ("/src/core/core"));
const Element = Core.Element;
const ExtensibleModel = Core.ExtensibleModel;


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
