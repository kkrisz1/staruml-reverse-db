const DbNodeDomain = require("./DbNodeDomain");
const MsSqlDbClient = require("../../node/MsSqlDbClient");

class MsSqlNodeDomain extends DbNodeDomain {
  /**
   * Node Domain for MS SQL Client
   *
   * @constructor
   */
  constructor(options) {
    super(new MsSqlDbClient(options));
  }
}

module.exports = MsSqlNodeDomain;
