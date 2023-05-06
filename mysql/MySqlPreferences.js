const DbPreferences = require("../db/DbPreferences");

class MySqlPreferences extends DbPreferences {
    /**
     * MySqlPreferences
     *
     * @constructor
     */
    constructor() {
        super("db.mysql");
    }
}

module.exports = MySqlPreferences;
