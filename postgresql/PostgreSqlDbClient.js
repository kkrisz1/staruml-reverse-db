const DbClient = require("../db/DbClient");

const ConnectionPool = require('pg-pool');
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
      this.pool = new ConnectionPool(Object.assign(this.options, this.poolConfig));
      types.setTypeParser(BIT_OID, val => parseInt(val));
    }

    return this.pool.query(sqlStr.toString(), inputParams);
  }

  _cmdClose() {
    return new Promise(resolve => {
      if (this.pool) {
        this.pool.end(() => console.log("Pool is ended..."));
        this.pool = null;
      }
      resolve();
    });
  }
}

module.exports = PostgreSqlDbClient;
