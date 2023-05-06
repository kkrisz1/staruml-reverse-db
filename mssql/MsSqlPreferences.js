const DbPreferences = require("../db/DbPreferences");

class MsSqlPreferences extends DbPreferences {
    /**
     * MsSqlPreferences
     *
     * @constructor
     */
    constructor() {
        super("db.mssql");
    }
}

module.exports = MsSqlPreferences;
