/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, node: true */
/*global */
(function () {
  "use strict";

  var objectAssign = require('object-assign');
  var ConnectionPool = require('pg-pool');
  var types = require('pg').types;
  var BIT_OID = 1560;

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
    log: console.log
  };

  function _cmdExecStmnt(config, requestId, sqlStr, inputParams) {
    if (!_pool) {
      console.log('Pool will be created');
      _pool = new ConnectionPool(objectAssign(config, _poolConfig));
      console.log('Pool is created');
      _pool.on('error', error);
      _pool.on('connect', connect);
      _pool.on('acquire', acquire);
      types.setTypeParser(BIT_OID, function (val) {
        return parseInt(val);
      })
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

    console.log('Execute query', sql, inputs);
    connection.query(sql, inputs, function (err, res) {
      if (err) {
        console.error(err);
        error(err);
        return;
      }

      _domainManager.emitEvent("postgreSqlDbClient", "statementComplete", [requestId, res.rowCount, res.rows]);
    });
  }

  function connect(client) {
    //console.log('connect');
  }

  function acquire(client) {
    //console.log('acquire');
  }

  function error(err, client) {
    console.error('Connection fails to connect to the SQL Server', err);
    _cmdClose();
    _domainManager.emitEvent("postgreSqlDbClient", "error", err);
  }

  /**
   * Initialize the 'postgreSqlDbClient' domain with commands and events.
   * @param {DomainManager} domainManager The DomainManager for the server
   */
  function init(domainManager) {
    _domainManager = domainManager;
    if (!domainManager.hasDomain("postgreSqlDbClient")) {
      domainManager.registerDomain("postgreSqlDbClient", {major: 0, minor: 1});
    }

    domainManager.registerCommand(
        "postgreSqlDbClient",       // domain name
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
        "postgreSqlDbClient",       // domain name
        "close",    // command name
        _cmdClose,   // command handler function
        false,          // this command is synchronous in Node
        "Close all connections",
        [],
        []
    );

    domainManager.registerEvent(
        "postgreSqlDbClient",           // domain name
        "statementComplete",  // event name
        [ // event arguments
          {name: "requestId", type: "string", description: "request identification"},
          {name: "rowCount", type: "string", description: "Number of rows"},
          {name: "rows", type: "array", description: "Result of the SQL statement"}
        ]
    );

    domainManager.registerEvent(
        "postgreSqlDbClient",           // domain name
        "rowReceived",  // event name
        [ // event arguments
          {name: "requestId", type: "string", description: "request identification"},
          {name: "row", type: "object", description: "Collection of a row values"}
        ]
    );

    domainManager.registerEvent(
        "postgreSqlDbClient",           // domain name
        "error",  // event name
        [ // event arguments
          {name: "err", type: "object", description: "Error object"}
        ]
    );
  }

  exports.init = init;
}());