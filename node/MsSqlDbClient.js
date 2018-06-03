const DbClient = require("./DbClient");

const ConnectionPool = require('tedious-connection-pool');
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

class MsSqlDbClient extends DbClient {
  constructor(options) {
    super(options, null, {
      min: 5,
      max: 10,
      log: true
    });
  }

  _cmdExecStmnt(requestId, sqlStr, inputParams) {
    let result = new $.Deferred();

    if (!this.pool) {
      this.pool = new ConnectionPool(this.poolConfig, this.options);
      this.pool.on("error", this.errorHandler);
    }

    this.pool.acquire((err, connection) => {
      if (err) {
        console.error("Connection failed: ", err);
        return;
      }

      this.exec(connection, requestId, sqlStr, inputParams);
    });

    result.resolve();
    return result.promise();
  }

  _cmdClose() {
    let result = new $.Deferred();

    if (this.pool) {
      this.pool.drain();
      this.pool = null;
    }

    result.resolve();
    return result.promise();
  }

  exec(connection, requestId, sql, inputs) {
    sql = sql.toString();

    let request = new Request(sql, (err, rowCount, rows) => {
          if (err) {
            this.errorHandler(err);
            return;
          }

          connection.release();
          $(this).trigger("statementComplete", [requestId, rowCount, rows]);
        }
    );
    request.on("columnMetadata", this.columnMetadata);
    request.on("row", columns => {
      $(this).trigger("rowReceived", [requestId, columns]);
    });
    request.on("done", this.requestDone);

    inputs.forEach(input => {
      request.addParameter(input.name, this.getTediousType(input.type), input.value);
    });

    connection.execSql(request);
  }

  getTediousType(type) {
    switch (type) {
      case 'varchar':
        return TYPES.VarChar;
    }
  }

  requestDone(rowCount, more) {
    //console.log(rowCount + ' rows');
  }

  errorHandler(err) {
    console.error("Error is occurred", err);
    this._cmdClose();
    $(this).trigger("error", err);
  }

  columnMetadata(columnsMetadata) {
    // columnsMetadata.forEach(function (column) {
    //   console.log(column);
    // });
  }
}

module.exports = MsSqlDbClient;
