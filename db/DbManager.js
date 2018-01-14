/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  /**
   * DbManager
   * @constructor
   * @param {NodeDomain} nodeDomain
   * @param {DbRequest} request
   */
  function DbManager(nodeDomain, request) {
    /**
     * @private
     * @member {Request}
     */
    this.request = request;

    /**
     * @private
     * @member {NodeDomain}
     */
    this.nodeDomain = nodeDomain;
  }

  DbManager.prototype.executeSql = function (handleRowReceived, handleStatementComplete) {
    var result = new $.Deferred();
    var self = this;

    self.nodeDomain.send(self.request)
        .then(function () {
          self.handleEvents(self.request.id, handleRowReceived, handleStatementComplete)
              .then(result.resolve, result.reject);
        }, result.reject);

    return result.promise();
  };


  DbManager.prototype.handleEvents = function (requestId, handleRowReceived, handleStatementComplete) {
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


  DbManager.prototype.closeAllConnections = function () {
    var self = this;

    return self.nodeDomain.close();
  };


  DbManager.prototype.subscribe = function (event, callback) {
    var self = this;

    $(self.nodeDomain).on(event, callback);
  };


  DbManager.prototype.unsubscribe = function (event) {
    var self = this;

    $(self.nodeDomain).off(event);
  };

  module.exports = DbManager;
});
