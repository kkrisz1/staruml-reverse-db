const DbClient = require("../db/DbClient");

const mysql = require('mysql2/promise');

class MySqlDbClient extends DbClient {
    constructor(options) {
        super(options, null, {
            connectionLimit: 10,
            debug: options.logging
        });
    }

    _cmdExecStmnt(requestId, sqlStr, inputParams) {
        if (!this.pool) {
            this.pool = mysql.createPool(Object.assign(this.options, this.poolConfig));
        }

        return this.pool.query(sqlStr.toString(), inputParams)
            .then(([rows, fields]) => {
                return {rowCount: rows.length, rows: rows};
            });
    }

    _cmdClose() {
        if (!this.pool) {
            return new Promise(resolve => {
                resolve();
            })
                .then(() => console.log("No pool is created..."));
        }

        return this.pool.end()
            .then(() => console.log("Pool is ended..."))
            .then(() => this.pool = null);
    }
}

module.exports = MySqlDbClient;
