const DbManager = require("../db/DbManager");
const PostgreSqlDbClient = require("./PostgreSqlDbClient");

class PostgreSqlManager extends DbManager {

    /**
     * MySqlManager
     *
     * @constructor
     * @param {object} options
     */
    constructor(options) {
        super(new PostgreSqlDbClient(options && {
            user: options.userName,
            password: options.password,
            host: options.server,
            port: options.options.port,
            database: options.options.database || options.userName,
            ssl: options.options.ssl,
            logging: options.options.logging
        }));
    }
}

module.exports = PostgreSqlManager;
