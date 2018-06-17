/**
 * Analyze all columns of tables and their relationships under the given database
 *
 * @param {Object} options
 * @param {Object} dbAnalyzer
 * @return {Promise} jqueryPromise
 */
function analyze(options, dbAnalyzer) {
  return dbAnalyzer.analyze();
}

exports.analyze = analyze;
