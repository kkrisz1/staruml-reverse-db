class DbRequest {
    /**
     * DbRequest
     *
     * @constructor
     * @param {string} sql
     * @param {Array.<RequestInput>} inputs
     */
    constructor(sql, inputs) {
        /**
         * @member {string}
         */
        this.id = app.repository.generateGuid();

        /**
         * @member {string}
         */
        this.sql = sql;

        /**
         * @member {Array.<RequestInput>}
         */
        this.inputs = inputs;
    }
}

module.exports = DbRequest;
