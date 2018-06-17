const DbManager = require("../db/DbManager");
const MsSqlDbClient = require("./MsSqlDbClient");

class MsSqlManager extends DbManager {

  /**
   * MsSqlManager
   *
   * @constructor
   * @param {object} options
   */
  constructor(options) {
    super(new MsSqlDbClient(options));
  }
}

module.exports = MsSqlManager;
