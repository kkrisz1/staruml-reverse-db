/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var OperationBuilder = app.getModule("core/OperationBuilder");
  var Repository = app.getModule("core/Repository");

  var Request = require("db/DbRequest");
  var DbAnalyzer = require("db/DbAnalyzer");
  var Manager = require("mysql/MySqlManager");

  /**
   * MySqlAnalyzer
   * @constructor
   */
  function MySqlAnalyzer(options, model) {
    DbAnalyzer.apply(this, [options, model, new Manager(options)]);
  }

  // inherits from DbAnalyzer
  MySqlAnalyzer.prototype = Object.create(DbAnalyzer.prototype);
  MySqlAnalyzer.prototype.constructor = MySqlAnalyzer;


  MySqlAnalyzer.prototype.analyze = function () {
    var self = this;
    var sqlStr = "SELECT col.TABLE_CATALOG AS table_catalog, "
        + "  col.TABLE_SCHEMA AS owner, "
        + "  col.TABLE_NAME AS table_name, "
        + "  col.COLUMN_NAME AS column_name, "
        + "  col.ORDINAL_POSITION AS ordinal_position, "
        + "  col.COLUMN_DEFAULT AS default_setting, "
        + "  col.DATA_TYPE AS data_type, "
        + "  col.CHARACTER_MAXIMUM_LENGTH AS max_length, "
        + "  col.DATETIME_PRECISION AS date_precision, "
        + "  CAST(CASE col.IS_NULLABLE WHEN 'NO' THEN 0 ELSE 1 END AS unsigned) AS is_nullable, "
        + "  CAST(CASE ks.CONSTRAINT_TYPE WHEN 'PRIMARY KEY' THEN 1 ELSE 0 END AS unsigned) AS is_primary_key, "
        + "  CAST(CASE ks.CONSTRAINT_TYPE WHEN 'UNIQUE' THEN 1 ELSE 0 END AS unsigned) AS is_unique, "
        + "  CAST(CASE ks.CONSTRAINT_TYPE WHEN 'FOREIGN KEY' THEN 1 ELSE 0 END AS unsigned) AS is_foreign_key, "
        + "  ks.FK_NAME AS foreign_key_name, "
        + "  ks.REFERENCED_TABLE_NAME AS referenced_table_name, "
        + "  ks.REFERENCED_COLUMN_NAME AS referenced_column_name "
        + "FROM INFORMATION_SCHEMA.COLUMNS as col "
        + "  LEFT JOIN( "
        + "    SELECT k.TABLE_SCHEMA AS TABLE_SCHEMA, "
        + "      k.TABLE_NAME AS TABLE_NAME, "
        + "      k.COLUMN_NAME AS COLUMN_NAME, "
        + "      t.CONSTRAINT_TYPE AS CONSTRAINT_TYPE, "
        + "      t.CONSTRAINT_NAME AS FK_NAME, "
        + "      k.REFERENCED_TABLE_NAME AS REFERENCED_TABLE_NAME, "
        + "      k.REFERENCED_COLUMN_NAME AS REFERENCED_COLUMN_NAME "
        + "    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS t "
        + "      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS k "
        + "        USING (CONSTRAINT_NAME, TABLE_SCHEMA, TABLE_NAME) "
        + "    ) AS ks "
        + "  ON col.TABLE_NAME = ks.TABLE_NAME "
        + "  AND col.TABLE_SCHEMA = ks.TABLE_SCHEMA "
        + "  AND col.COLUMN_NAME = ks.COLUMN_NAME "
        + "WHERE col.TABLE_SCHEMA = ? "
        + "AND col.TABLE_CATALOG = ? "
        + "ORDER BY col.TABLE_NAME, col.ORDINAL_POSITION;";

    var request = new Request(sqlStr, [self.options.owner || self.options.userName, self.options.options.database]);

    return self.executeSql(request, function () {
    }, function (rowCount, rows) {
      OperationBuilder.begin("Generate ER Data Model");
      rows.forEach(function (row) {
        self.performFirstPhase(row, function (columnProperty) {
          return columnProperty;
        });
      });
      self.performSecondPhase();
      OperationBuilder.end();
      Repository.doOperation(OperationBuilder.getOperation());
    })
  };

  module.exports = MySqlAnalyzer;
});
