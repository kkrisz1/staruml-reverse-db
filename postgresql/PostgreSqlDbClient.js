const DbClient = require("../db/DbClient");

const {Pool} = require('pg');
const types = require('pg').types;
const BIT_OID = 1560;

class PostgreSqlDbClient extends DbClient {
    constructor(options) {
        super(options, null, {
            min: 5,
            max: 10,
            log: options.logging ? console.log : null
        });
    }

    _cmdExecStmnt(requestId, sqlStr, inputParams) {
        if (!this.pool) {
            this.pool = new Pool(Object.assign(this.options, this.poolConfig));
            types.setTypeParser(BIT_OID, val => parseInt(val));
        }

        return this.pool.query(sqlStr.toString(), inputParams);
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

module.exports = PostgreSqlDbClient;
