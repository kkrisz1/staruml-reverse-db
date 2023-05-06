const DbClient = require("../db/DbClient");

const sql = require('mssql')
const TYPES = sql.TYPES;

class MsSqlDbClient extends DbClient {
    constructor(options) {
        super(options, null, {
            min: 5,
            max: 10,
            log: options.options.logging
        });
    }

    _cmdExecStmnt(requestId, sqlStr, inputs) {
        return sql.connect(Object.assign(this.options, this.poolConfig))
            .then((pool) => {   // global pool
                if (!this.pool) {
                    this.pool = pool;
                }
                const request = pool.request();
                inputs.forEach(input => {
                    request.input(input.name, this.getSqlType(input.type), input.value);
                });
                return request.query(sqlStr.toString());
            })
            .then(result => {
                return {
                    rowCount: result.recordset.length,
                    rows: result.recordset,
                }
            })
            .catch(error => {
                throw {
                    message: error.message,
                };
            });
    }

    _cmdClose() {
        if (!this.pool) {
            return new Promise(resolve => {
                resolve();
            })
                .then(() => console.log("No pool is created..."));
        }

        return this.pool.close()
            .then(() => console.log("Pool is ended..."))
            .then(() => this.pool = null);
    }

    getSqlType(type) {
        switch (type) {
            case 'varchar':
                return TYPES.NVarChar;
        }
    }
}

module.exports = MsSqlDbClient;
