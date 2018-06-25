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

    return this.pool.query(sqlStr.toString(), inputParams).then(([rows, fields]) => {
      return {rowCount: rows.length, rows: rows};
    });
  }

  _cmdClose() {
    if (this.pool) {
      this.pool.end(() => console.log("Pool is ended..."));
      this.pool = null;
    }
    return this.pool;
  }

  connectHandler(client) {
    // console.log("connect");
  }

  acquireHandler(client) {
    // console.log("acquire");
  }

  errorHandler(err) {
    // console.error("Error is occurred", err);
  }
}

module.exports = MySqlDbClient;
