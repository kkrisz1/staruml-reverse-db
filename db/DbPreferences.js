class DbPreferences {
    /**
     * DbPreferences
     *
     * @constructor
     * @param {string} preferenceId
     */
    constructor(preferenceId) {
        /**
         * @private
         * @member {string}
         */
        this.preferenceId = preferenceId;

        this.connPrefKeyPrefix = this.preferenceId + ".connection";
        this.connPrefOptKeyPrefix = this.connPrefKeyPrefix + ".options";
    }

    /**
     * Preference ID
     *
     * @return {object}
     */
    getId() {
        return this.preferenceId;
    };

    /**
     * Connection preference prefix
     *
     * @return {object}
     */
    getConnPrefKeyPrefix() {
        return this.connPrefKeyPrefix;
    };

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
                domain: app.preferences.get(this.connPrefOptKeyPrefix + ".domain") === ""
                ? undefined
                : app.preferences.get(this.connPrefOptKeyPrefix + ".domain"),
                ssl: app.preferences.get(this.connPrefOptKeyPrefix + ".ssl"),
                logging: app.preferences.get(this.connPrefOptKeyPrefix + ".logging"),
                trustServerCertificate: app.preferences.get(this.connPrefOptKeyPrefix + ".trustServerCertificate"),
            },
        };
    };
}

module.exports = DbPreferences;
