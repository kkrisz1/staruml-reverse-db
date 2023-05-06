function flattenArray() {
    if (Array.prototype.flatten) {
        console.info("flatten has already been defined");
        return;
    }

    Array.prototype.flatten = getArrayProp =>
        this.reduce((acc, val) => acc.concat(getArrayProp(val)), []);
}

exports.flattenArray = flattenArray;
