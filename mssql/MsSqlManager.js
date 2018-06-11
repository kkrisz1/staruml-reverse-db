const DbManager = require("../db/DbManager");
const MsSqlNodeDomain = require("../util/node/MsSqlNodeDomain");

class MsSqlManager extends DbManager {

  /**
   * MsSqlManager
   *
   * @constructor
   * @param {object} options
   */
  constructor(options) {
    super(new MsSqlNodeDomain(options));
  }
}

module.exports = MsSqlManager;
