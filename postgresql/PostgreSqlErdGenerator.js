const DbErdGenerator = require("../db/DbErdGenerator");
const PostgreSqlAnalyzer = require("./PostgreSqlAnalyzer");

class PostgreSqlErdGenerator extends DbErdGenerator {

    /**
     * PostgreSqlErdGenerator
     *
     * @constructor
     */
    constructor(options, model) {
        super(options, new PostgreSqlAnalyzer(options, model));
    }
}

module.exports = PostgreSqlErdGenerator;
