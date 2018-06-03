class DbNodeDomain {
  /**
   * Node Domain for DB Clients
   *
   * @constructor
   */
  constructor(client) {
    /**
     * DB Client
     *
     * @private
     * @member {object}
     */
    this._client = client;
  }

  get client() {
    return this._client;
  }

  /**
   * Execute SQL statement
   *
   * @param {DbRequest} request
   * @return {Promise}
   */
  send(request) {
    return this._client._cmdExecStmnt(request.id, request.sql, request.inputs)
  };

  /**
   * Close all opened connections
   *
   * @return {Promise}
   */
  close() {
    return this._client._cmdClose();
  };
}

module.exports = DbNodeDomain;