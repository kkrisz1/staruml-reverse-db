const DbManager = require("../db/DbManager");
const MySqlNodeDomain = require("../util/node/MySqlNodeDomain");

class MySqlManager extends DbManager {

  /**
   * MySqlManager
   *
   * @constructor
   * @param {object} options
   */
  constructor(options) {
    super(new MySqlNodeDomain(options));
  }
}

module.exports = MySqlManager;
