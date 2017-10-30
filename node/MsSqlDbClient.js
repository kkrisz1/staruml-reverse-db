/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, node: true */
/*global */
(function () {
  "use strict";

  var ConnectionPool = require('tedious-connection-pool');
  var Request = require('tedious').Request;
  var TYPES = require('tedious').TYPES;

  /**
   * @private
   * @type {DomainManager}
   * The DomainManager passed in at init.
   */
  var _domainManager = null;

  /**
   * @private
   * @type {ConnectionPool}
   * ConnectionPool.
   */
  var _pool = null;

  /**
   * @private
   * @type {Object}
   * ConnectionPool configurations.
   */
  var _poolConfig = {
    min: 5,
    max: 10,
    log: true
  };

  function _cmdExecStmnt(config, requestId, sqlStr, inputParams) {
    if (!_pool) {
      _pool = new ConnectionPool(_poolConfig, config);
      _pool.on('error', error);
    }

    _pool.acquire(function (err, connection) {
      if (err) {
        console.error('Connection failed: ', err);
        return;
      }

      exec(connection, requestId, sqlStr, inputParams);
    });
  }

  function _cmdClose() {
    if (_pool) {
      _pool.drain();
      _pool = null;
    }
  }

  function exec(connection, requestId, sql, inputs) {
    sql = sql.toString();

    var request = new Request(sql, function (err, rowCount, rows) {
        if (err) {
          console.error('Statement failed: ', err);
          return;
        }

        connection.release();
        _domainManager.emitEvent("msSqlDbClient", "statementComplete", [requestId, rowCount, rows]);
      }
    );
    request.on('columnMetadata', columnMetadata);
    request.on('row', function (columns) {
      _domainManager.emitEvent("msSqlDbClient", "rowReceived", [requestId, columns]);
    });
    request.on('done', requestDone);

    inputs.forEach(function (input) {
      request.addParameter(input.name, getTediousType(input.type), input.value);
    });

    connection.execSql(request);
  }

  function getTediousType(type) {
    switch (type) {
      case 'varchar':
        return TYPES.VarChar;
    }
  }

  function requestDone(rowCount, more) {
    //console.log(rowCount + ' rows');
  }

  function error(err) {
    console.error('Connection fails to connect to the SQL Server', err);
    _cmdClose();
    _domainManager.emitEvent("msSqlDbClient", "error", err);
  }

  function columnMetadata(columnsMetadata) {
    // columnsMetadata.forEach(function (column) {
    //   console.log(column);
    // });
  }

  /**
   * Initialize the 'msSqlDbClient' domain with commands and events.
   * @param {DomainManager} domainManager The DomainManager for the server
   */
  function init(domainManager) {
    _domainManager = domainManager;
    if (!domainManager.hasDomain("msSqlDbClient")) {
      domainManager.registerDomain("msSqlDbClient", { major: 0, minor: 1 });
    }

    domainManager.registerCommand(
      "msSqlDbClient",       // domain name
      "execStmnt",    // command name
      _cmdExecStmnt,   // command handler function
      false,          // this command is synchronous in Node
      "Execute SQL statement",
      [ // parameters
        { name: "config", type: "object", description: "configurations to connect to the database" },
        { name: "requestId", type: "string", description: "request identification" },
        { name: "sql", type: "string", description: "given SQL statement will be executed" },
        { name: "input", type: "array", description: "input parameters if it SQL statement is parameterized" }
      ],
      [ // return value
        // { name: "resultSet", type: "object", description: "result of the given SQL statement" }
      ]
    );

    domainManager.registerCommand(
      "msSqlDbClient",       // domain name
      "close",    // command name
      _cmdClose,   // command handler function
      false,          // this command is synchronous in Node
      "Close all connections",
      [],
      []
    );

    domainManager.registerEvent(
      "msSqlDbClient",           // domain name
      "statementComplete",  // event name
      [ // event arguments
        { name: "requestId", type: "string", description: "request identification" },
        { name: "rowCount", type: "string", description: "Number of rows" },
        { name: "rows", type: "array", description: "Result of the SQL statement" }
      ]
    );

    domainManager.registerEvent(
      "msSqlDbClient",           // domain name
      "rowReceived",  // event name
      [ // event arguments
        { name: "requestId", type: "string", description: "request identification" },
        { name: "row", type: "object", description: "Collection of a row values" }
      ]
    );

    domainManager.registerEvent(
      "msSqlDbClient",           // domain name
      "error",  // event name
      [ // event arguments
        { name: "err", type: "object", description: "Error object" },
      ]
    );
  }

  exports.init = init;
}());