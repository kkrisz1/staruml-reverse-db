function flattenArray() {
  if (Array.prototype.flatten) {
    console.info("flatten has already been defined");
    return;
  }

  Array.prototype.flatten = function (getArrayProp) {
    return this.reduce(function (acc, val) {
      return acc.concat(getArrayProp(val));
    }, []);
  };
}

exports.flattenArray = flattenArray;