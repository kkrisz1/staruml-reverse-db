const DbClient = require("./DbClient");

const mysql = require('mysql2');

class MySqlDbClient extends DbClient {
  constructor(options) {
    super(options, null, {
      connectionLimit: 10,
      debug: true
    });
  }

  _cmdExecStmnt(requestId, sqlStr, inputParams) {
    let result = new $.Deferred();

    if (!this.pool) {
      this.pool = mysql.createPool(Object.assign(this.options, this.poolConfig));
      this.pool.on("error", this.errorHandler);
      this.pool.on("connection", this.connect);
      this.pool.on("acquire", this.acquire);
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
    this.pool.execute(sql.toString(), inputs, (err, results, fields) => {
      if (err) {
        this.errorHandler(err);
        return;
      }

      $(this).trigger("statementComplete", [requestId, results.length, results]);
    });
  }

  connect(client) {
    // console.log("connect");
  }

  acquire(client) {
    // console.log("acquire");
  }

  errorHandler(err) {
    console.error("Error is occurred", err);
    this._cmdClose();
    $(this).trigger("error", err);
  }
}

module.exports = MySqlDbClient;
