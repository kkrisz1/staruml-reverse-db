const DbManager = require("../db/DbManager");
const MySqlDbClient = require("./MySqlDbClient");

class MySqlManager extends DbManager {

    /**
     * MySqlManager
     *
     * @constructor
     * @param {object} options
     */
    constructor(options) {
        super(new MySqlDbClient(options && {
            user: options.userName,
            password: options.password,
            host: options.server,
            port: options.options.port,
            database: options.owner,
            ssl: options.options.ssl,
            debug: options.options.logging
        }));
    }
}

module.exports = MySqlManager;
