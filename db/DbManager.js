class DbManager {
    /**
     * DbManager
     *
     * @constructor
     * @param {object} client
     */
    constructor(client) {
        /**
         * DB Client
         *
         * @private
         */
        this._client = client;
    }

    executeSql(request) {
        return this._client._cmdExecStmnt(request.id, request.sql, request.inputs)
    };

    closeAllConnections() {
        return this._client._cmdClose();
    };
}

module.exports = DbManager;
