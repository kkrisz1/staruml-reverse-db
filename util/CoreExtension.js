const Element = type.Element;
const ExtensibleModel = type.ExtensibleModel;


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
    Element.prototype.findByNameIgnoreCase = name => this.getChildren().find(child => child.name.toUpperCase() === name.toUpperCase());
}

function getTagValue() {
    /**
     * Return value of a specific tag
     *
     * @param {string} tagName
     * @param {Function} getValue
     * @return {string|boolean|reference|number|undefined}
     */
    ExtensibleModel.prototype.getTagValue = (tagName, getValue) => {
        for (let i = 0; i < this.tags.length; i++) {
            const tag = this.tags[i];
            if (tag.name === tagName) {
                return getValue ? getValue(tag) : tag.value;
            }
        }
        return undefined;
    };
}

exports.findElementByNameIgnoreCase = findElementByNameIgnoreCase;
exports.getTagValue = getTagValue;
