const DbPreferences = require("../db/DbPreferences");

class PostgreSqlPreferences extends DbPreferences {
  /**
   * PostgreSqlPreferences
   *
   * @constructor
   */
  constructor() {
    super("db.postgresql");
  }

  /**
   * Connection options
   *
   * @return {object}
   */
  getConnOptions() {
    return Object.assign({options: {ssl: app.preferences.get(this.connPrefOptKeyPrefix + ".ssl")}}, super.getConnOptions());
  }
}

module.exports = PostgreSqlPreferences;
