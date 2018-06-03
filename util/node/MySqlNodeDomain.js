const DbNodeDomain = require("./DbNodeDomain");
const MySqlDbClient = require("../../node/MySqlDbClient");

class MySqlNodeDomain extends DbNodeDomain {
  /**
   * Node Domain for MySQL Client
   *
   * @constructor
   */
  constructor(options) {
    super(new MySqlDbClient(options && {
      user: options.userName,
      password: options.password,
      host: options.server,
      port: options.options.port,
      database: options.owner
    }));
  }
}

module.exports = MySqlNodeDomain;