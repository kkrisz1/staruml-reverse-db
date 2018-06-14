class DbManager {
  /**
   * DbManager
   *
   * @constructor
   * @param {DbNodeDomain} nodeDomain
   */
  constructor(nodeDomain) {
    /**
     * @private
     * @member {DbNodeDomain}
     */
    this.nodeDomain = nodeDomain;
  }

  executeSql(request, handleRowReceived, handleStatementComplete) {
    let result = new $.Deferred();
    let self = this;

    self.nodeDomain.send(request)
        .then(() => {
          self.handleEvents(request.id, handleRowReceived, handleStatementComplete)
              .then(result.resolve, result.reject);
        }, result.reject);

    return result.promise();
  };

  handleEvents(requestId, handleRowReceived, handleStatementComplete) {
    let result = new $.Deferred();
    let self = this;

    self.subscribe("rowReceived", (event, rId, row) => {
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

    self.subscribe("statementComplete", (event, rId, rowCount, rows) => {
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

    self.subscribe("error", (event, err) => {
      self.unsubscribe("rowReceived");
      self.unsubscribe("statementComplete");
      self.unsubscribe("error");

      result.reject(err);
    });

    return result.promise();
  };


  closeAllConnections() {
    let self = this;

    return self.nodeDomain.close();
  };


  subscribe(event, callback) {
    let self = this;

    $(self.nodeDomain.client).on(event, callback);
  };


  unsubscribe(event) {
    let self = this;

    $(self.nodeDomain.client).off(event);
  };
}

module.exports = DbManager;
