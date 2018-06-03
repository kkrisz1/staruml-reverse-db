const DbNodeDomain = require("./DbNodeDomain");
const PostgreSqlDbClient = require("../../node/PostgreSqlDbClient");

class PostgreSqlNodeDomain extends DbNodeDomain {
  /**
   * Node Domain for PostgreSQL Client
   *
   * @constructor
   */
  constructor(options) {
    super(new PostgreSqlDbClient(options && {
      user: options.userName,
      password: options.password,
      host: options.server,
      port: options.options.port,
      database: options.options.database || options.userName
    }
    ));
  }
}

module.exports = PostgreSqlNodeDomain;