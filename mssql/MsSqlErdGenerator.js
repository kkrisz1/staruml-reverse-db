const DbErdGenerator = require("../db/DbErdGenerator");
const MsSqlAnalyzer = require("./MsSqlAnalyzer");

class MsSqlErdGenerator extends DbErdGenerator {

    /**
     * MsSqlErdGenerator
     *
     * @constructor
     */
    constructor(options, model) {
        super(options, new MsSqlAnalyzer(options, model));
    }
}

module.exports = MsSqlErdGenerator;
