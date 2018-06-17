const DbClient = require("../db/DbClient");

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

  _cmdExecStmnt(requestId, sqlStr, inputs) {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        this.pool = new ConnectionPool(this.poolConfig, this.options);
        this.pool.on("error", err => reject(new Error(err)));
      }

      this.pool.acquire((err, connection) => {
        if (err) {
          console.error("Connection failed: ", err);
          reject(new Error(err));
          return;
        }

        let request = new Request(sqlStr.toString(), (err, rowCount, rows) => {
              if (err) {
                reject(new Error(err));
                return;
              }

              connection.release();
              resolve({rowCount: rowCount, rows: rows});
            }
        );
        inputs.forEach(input => {
          request.addParameter(input.name, this.getTediousType(input.type), input.value);
        });

        connection.execSql(request);
      })
    });
  }

  _cmdClose() {
    return new Promise(resolve => {
      if (this.pool) {
        this.pool.drain();
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

  requestDone(rowCount, more) {
    //console.log(rowCount + ' rows');
  }

  errorHandler(err) {
    // console.error("Error is occurred", err);
  }

  columnMetadata(columnsMetadata) {
    // columnsMetadata.forEach(function (column) {
    //   console.log(column);
    // });
  }
}

module.exports = MsSqlDbClient;
