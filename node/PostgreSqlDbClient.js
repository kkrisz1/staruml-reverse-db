const DbClient = require("./DbClient");

const ConnectionPool = require('pg-pool');
const types = require('pg').types;
const BIT_OID = 1560;

class PostgreSqlDbClient extends DbClient {
  constructor(options) {
    super(options, null, {
      min: 5,
      max: 10,
      log: console.log
    });
  }

  _cmdExecStmnt(requestId, sqlStr, inputParams) {
    let result = new $.Deferred();

    if (!this.pool) {
      this.pool = new ConnectionPool(Object.assign(this.options, this.poolConfig));
      this.pool.on("error", this.errorHandler);
      this.pool.on("connect", this.connectHandler);
      this.pool.on("acquire", this.acquireHandler);
      types.setTypeParser(BIT_OID, val => parseInt(val));
    }

    this.exec(requestId, sqlStr, inputParams);

    result.resolve();
    return result.promise();
  }

  _cmdClose() {
    let result = new $.Deferred();

    if (this.pool) {
      this.pool.end(() => console.log("Pool is ended..."));
      this.pool = null;
    }

    result.resolve();
    return result.promise();
  }

  exec(requestId, sql, inputs) {
    this.pool.query(sql.toString(), inputs, (err, res) => {
      if (err) {
        this.errorHandler(err);
        return;
      }

      $(this).trigger("statementComplete", [requestId, res.rowCount, res.rows]);
    });
  }

  connectHandler(client) {
    // console.log("connect");
  }

  acquireHandler(client) {
    // console.log("acquire");
  }

  errorHandler(err, client) {
    console.error("Error is occurred", err);
    this._cmdClose();
    $(this).trigger("error", err);
  }
}

module.exports = PostgreSqlDbClient;
