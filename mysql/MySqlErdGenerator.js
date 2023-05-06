const DbErdGenerator = require("../db/DbErdGenerator");
const MySqlAnalyzer = require("./MySqlAnalyzer");

class MySqlErdGenerator extends DbErdGenerator {

    /**
     * MySqlErdGenerator
     *
     * @constructor
     */
    constructor(options, model) {
        super(options, new MySqlAnalyzer(options, model));
    }
}

module.exports = MySqlErdGenerator;
