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
}

module.exports = PostgreSqlPreferences;
