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


    getConnOptions() {
        const connOptions = super.getConnOptions();

        connOptions.options.domain = app.preferences.get(this.connPrefOptKeyPrefix + ".domain");

        return connOptions;
    }
}

module.exports = MsSqlPreferences;
