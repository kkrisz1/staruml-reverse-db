const DbManager = require("../db/DbManager");
const PostgreSqlNodeDomain = require("../util/node/PostgreSqlNodeDomain");

class PostgreSqlManager extends DbManager {

  /**
   * MySqlManager
   *
   * @constructor
   * @param {object} options
   */
  constructor(options) {
    super(new PostgreSqlNodeDomain(options));
  }
}

module.exports = PostgreSqlManager;
