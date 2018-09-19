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
    return {
      userName: app.preferences.get(this.connPrefKeyPrefix + ".username"),
      password: app.preferences.get(this.connPrefKeyPrefix + ".password"),
      server: app.preferences.get(this.connPrefKeyPrefix + ".server"),
      owner: app.preferences.get(this.connPrefKeyPrefix + ".owner"),
      options: {
        port: app.preferences.get(this.connPrefOptKeyPrefix + ".port"),
        database: app.preferences.get(this.connPrefOptKeyPrefix + ".database"),
        logging: app.preferences.get(this.connPrefOptKeyPrefix + ".logging"),
        ssl: app.preferences.get(this.connPrefOptKeyPrefix + ".ssl")
      }
    };
  };
}

module.exports = PostgreSqlPreferences;
