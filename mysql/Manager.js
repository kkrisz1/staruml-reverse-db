/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var IdGenerator = app.getModule("core/IdGenerator");

  var MySqlNodeDomain = require("util/node/MySqlNodeDomain");


  /**
   * Request
   * @constructor
   * @param {string} sql
   * @param {Array.<RequestInput>} inputs
   */
  function Request(sql, inputs) {
    /**
     * @member {string}
     */
    this.id = IdGenerator.generateGuid();

    /**
     * @member {string}
     */
    this.sql = sql;

    /**
     * @member {Array.<RequestInput>}
     */
    this.inputs = inputs;
  }


  /**
   * RequestInput
   * @constructor
   * @param {string} name
   * @param {string} type
   * @param {string} value
   */
  function RequestInput(name, type, value) {
    /**
     * @private
     * @member {string}
     */
    this.name = name;

    /**
     * @private
     * @member {string}
     */
    this.type = type;

    /**
     * @private
     * @member {string}
     */
    this.value = value;
  }


  /**
   * Manager
   * @constructor
   * @param {Request} request
   * @param {object} options
   */
  function Manager(request, options) {
    /**
     * @private
     * @member {Request}
     */
    this.request = request;

    /**
     * @private
     * @member {MySqlNodeDomain}
     */
    this.nodeDomain = new MySqlNodeDomain(options);
  }

  Manager.prototype.executeSql = function (handleRowReceived, handleStatementComplete) {
    var result = new $.Deferred();
    var self = this;

    self.nodeDomain.send(self.request)
        .then(function () {
          self.handleEvents(self.request.id, handleRowReceived, handleStatementComplete)
              .then(result.resolve, result.reject);
        }, result.reject);

    return result.promise();
  };


  Manager.prototype.handleEvents = function (requestId, handleRowReceived, handleStatementComplete) {
    var result = new $.Deferred();
    var self = this;

    self.subscribe("rowReceived", function (event, rId, row) {
      if (rId !== requestId) {
        return;
      }

      try {
        handleRowReceived(row);
      } catch (err) {
        self.unsubscribe("rowReceived");
        result.reject(err);
      }
    });

    self.subscribe("statementComplete", function (event, rId, rowCount, rows) {
      if (rId !== requestId) {
        return;
      }

      self.unsubscribe("rowReceived");
      self.unsubscribe("statementComplete");
      self.unsubscribe("error");

      try {
        handleStatementComplete(rowCount, rows);
        result.resolve();
      } catch (err) {
        result.reject(err);
      }
    });

    self.subscribe("error", function (event, err) {
      self.unsubscribe("rowReceived");
      self.unsubscribe("statementComplete");
      self.unsubscribe("error");

      result.reject(err);
    });

    return result.promise();
  };


  Manager.prototype.closeAllConnections = function () {
    var self = this;

    return self.nodeDomain.close();
  };


  Manager.prototype.subscribe = function (event, callback) {
    var self = this;

    $(self.nodeDomain).on(event, callback);
  };


  Manager.prototype.unsubscribe = function (event) {
    var self = this;

    $(self.nodeDomain).off(event);
  };

  exports.Request = Request;
  exports.RequestInput = RequestInput;
  exports.Manager = Manager;
});
