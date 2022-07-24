const DbClient = require("../db/DbClient");

const tp = require('tedious-promises');
const ConnectionPool = require('tedious-connection-pool');
const TYPES = require('tedious').TYPES;

class MsSqlDbClient extends DbClient {
  constructor(options) {
    super(options, null, {
      min: 5,
      max: 10,
      log: options.options.logging
    });
  }

  _cmdExecStmnt(requestId, sqlStr, inputs) {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        this.pool = new ConnectionPool(this.poolConfig, this.options);
        this.pool.on("error", err => reject(err));
        tp.setConnectionPool(this.pool); // global scope
      }
      const request = tp.sql(sqlStr.toString());
      inputs.forEach(input => {
        request.parameter(input.name, this.getTediousType(input.type), input.value);
      });
      request.execute()
          .then(results => {
            resolve({rowCount: results.length, rows: results});
          })
          .fail(err => reject(err));
    });
  }

  _cmdClose() {
    return new Promise(resolve => {
      if (this.pool) {
        this.pool.drain(() => console.log("Pool is ended..."));
        this.pool = null;
      }

      resolve();
    });
  }

  getTediousType(type) {
    switch (type) {
      case 'varchar':
        return TYPES.VarChar;
    }
  }
}

module.exports = MsSqlDbClient;
