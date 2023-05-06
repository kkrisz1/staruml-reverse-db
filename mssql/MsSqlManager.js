const DbManager = require("../db/DbManager");
const MsSqlDbClient = require("./MsSqlDbClient");

class MsSqlManager extends DbManager {

    /**
     * MsSqlManager
     *
     * @constructor
     * @param {object} options
     */
    constructor(options) {
        super(new MsSqlDbClient(options && {
            user: options.userName,
            password: options.password,
            server: options.server,
            owner: options.owner,
            options: {
                port: options.options.port,
                database: options.options.database,
                encrypt: options.options.ssl,
                logging: options.options.logging,
                trustServerCertificate: options.options.trustServerCertificate,
            },
        }));
    }
}

module.exports = MsSqlManager;
