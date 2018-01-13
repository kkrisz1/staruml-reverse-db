/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, node: true */
/*global */
(function () {
  "use strict";

  var objectAssign = require('object-assign');
  var mysql = require('mysql2');

  /**
   * @private
   * @type {DomainManager}
   * The DomainManager passed in at init.
   */
  var _domainManager = null;

  /**
   * @private
   * @type {Pool}
   * ConnectionPool.
   */
  var _pool = null;

  /**
   * @private
   * @type {Object}
   * ConnectionPool configurations.
   */
  var _poolConfig = {
    connectionLimit: 10,
    debug: true
  };

  function _cmdExecStmnt(config, requestId, sqlStr, inputParams) {
    if (!_pool) {
      _pool = mysql.createPool(objectAssign(config, _poolConfig));
      _pool.on('error', error);
      _pool.on('connection', connect);
      _pool.on('acquire', acquire);
    }

    exec(_pool, requestId, sqlStr, inputParams);
  }

  function _cmdClose() {
    if (_pool) {
      _pool.end(function () {
        console.log('Pool is ended...');
      });
      _pool = null;
    }
  }

  function exec(connection, requestId, sql, inputs) {
    sql = sql.toString();

    connection.execute(sql, inputs, function (err, results, fields) {
      if (err) {
        error(err);
        return;
      }

      _domainManager.emitEvent("mySqlDbClient", "statementComplete", [requestId, results.length, results]);
    });
  }

  function connect(client) {
    //console.log('connect');
  }

  function acquire(client) {
    //console.log('acquire');
  }

  function error(err) {
    console.error('Error is occurred', err);
    _cmdClose();
    _domainManager.emitEvent("mySqlDbClient", "error", err);
  }

  /**
   * Initialize the 'mySqlDbClient' domain with commands and events.
   * @param {DomainManager} domainManager The DomainManager for the server
   */
  function init(domainManager) {
    _domainManager = domainManager;
    if (!domainManager.hasDomain("mySqlDbClient")) {
      domainManager.registerDomain("mySqlDbClient", {major: 0, minor: 1});
    }

    domainManager.registerCommand(
        "mySqlDbClient",       // domain name
        "execStmnt",    // command name
        _cmdExecStmnt,   // command handler function
        false,          // this command is synchronous in Node
        "Execute SQL statement",
        [ // parameters
          {name: "config", type: "object", description: "configurations to connect to the database"},
          {name: "requestId", type: "string", description: "request identification"},
          {name: "sql", type: "string", description: "given SQL statement will be executed"},
          {name: "input", type: "array", description: "input parameters if it SQL statement is parameterized"}
        ],
        [ // return value
          // { name: "resultSet", type: "object", description: "result of the given SQL statement" }
        ]
    );

    domainManager.registerCommand(
        "mySqlDbClient",       // domain name
        "close",    // command name
        _cmdClose,   // command handler function
        false,          // this command is synchronous in Node
        "Close all connections",
        [],
        []
    );

    domainManager.registerEvent(
        "mySqlDbClient",           // domain name
        "statementComplete",  // event name
        [ // event arguments
          {name: "requestId", type: "string", description: "request identification"},
          {name: "rowCount", type: "string", description: "Number of rows"},
          {name: "rows", type: "array", description: "Result of the SQL statement"}
        ]
    );

    domainManager.registerEvent(
        "mySqlDbClient",           // domain name
        "rowReceived",  // event name
        [ // event arguments
          {name: "requestId", type: "string", description: "request identification"},
          {name: "row", type: "object", description: "Collection of a row values"}
        ]
    );

    domainManager.registerEvent(
        "mySqlDbClient",           // domain name
        "error",  // event name
        [ // event arguments
          {name: "err", type: "object", description: "Error object"}
        ]
    );
  }

  exports.init = init;
}());