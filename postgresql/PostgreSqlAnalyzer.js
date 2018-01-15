/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var OperationBuilder = app.getModule("core/OperationBuilder");
  var Repository = app.getModule("core/Repository");

  var Request = require("db/DbRequest");
  var DbAnalyzer = require("db/DbAnalyzer");
  var Manager = require("postgresql/PostgreSqlManager");

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
    var sqlStr = "SELECT col.TABLE_CATALOG AS table_catalog , "
        + "  col.TABLE_SCHEMA AS owner, "
        + "  col.TABLE_NAME AS table_name, "
        + "  col.COLUMN_NAME AS column_name, "
        + "  col.ORDINAL_POSITION AS ordinal_position, "
        + "  col.COLUMN_DEFAULT AS default_setting, "
        + "  col.DATA_TYPE AS data_type, "
        + "  col.CHARACTER_MAXIMUM_LENGTH AS max_length, "
        + "  col.DATETIME_PRECISION AS date_precision, "
        + "  CAST(CASE col.IS_NULLABLE WHEN 'NO' THEN 0 ELSE 1 END AS bit) AS is_nullable, "
        + "  CAST(CASE WHEN pk.is_primary_key THEN 1 ELSE 0 END AS bit) AS is_primary_key, "
        + "  CAST(CASE WHEN pk.is_unique THEN 1 ELSE 0 END AS bit) AS is_unique, "
        + "  CAST(CASE WHEN fk.FK_NAME IS NULL THEN 0 ELSE 1 END AS bit) AS is_foreign_key, "
        + "  fk.FK_NAME AS foreign_key_name, "
        + "  fk.REFERENCED_TABLE_NAME AS referenced_table_name, "
        + "  fk.REFERENCED_COLUMN_NAME AS referenced_column_name "
        + "FROM INFORMATION_SCHEMA.COLUMNS as col "
        + "  LEFT JOIN ( "
        + "    SELECT o.relnamespace::regnamespace::text AS TABLE_SCHEMA, "
        + "      o.relname AS TABLE_NAME, "
        + "      a.attname AS COLUMN_NAME, "
        + "      i.indisprimary AS is_primary_key, "
        + "      i.indisunique AS is_unique "
        + "    FROM pg_index AS i "
        + "    JOIN pg_attribute AS a "
        + "      ON a.attrelid = i.indrelid "
        + "      AND a.attnum = ANY(i.indkey) "
        + "    JOIN pg_class AS o "
        + "      ON i.indrelid = o.relfilenode) AS pk "
        + "  ON col.TABLE_NAME = pk.TABLE_NAME "
        + "  AND col.TABLE_SCHEMA = pk.TABLE_SCHEMA "
        + "  AND col.COLUMN_NAME = pk.COLUMN_NAME "
        + "  LEFT JOIN ( "
        + "    SELECT conname as FK_NAME, "
        + "      cl.relnamespace::regnamespace::text AS TABLE_SCHEMA, "
        + "      cl2.relname AS TABLE_NAME, "
        + "      att2.attname AS COLUMN_NAME, "
        + "      cl.relname AS REFERENCED_TABLE_NAME, "
        + "      att.attname AS REFERENCED_COLUMN_NAME "
        + "    FROM ("
        + "      SELECT unnest(con1.conkey) AS \"parent\", "
        + "        unnest(con1.confkey) AS \"child\", "
        + "        con1.confrelid, "
        + "        con1.conrelid, "
        + "        con1.conname "
        + "      FROM pg_class cl "
        + "      JOIN pg_namespace ns "
        + "        ON cl.relnamespace = ns.oid "
        + "      JOIN pg_constraint con1 "
        + "        ON con1.conrelid = cl.oid) AS con "
        + "    JOIN pg_attribute att "
        + "      ON att.attrelid = con.confrelid "
        + "      AND att.attnum = con.child "
        + "    JOIN pg_class cl "
        + "      ON cl.oid = con.confrelid "
        + "    JOIN pg_attribute att2 "
        + "      ON att2.attrelid = con.conrelid "
        + "      AND att2.attnum = con.parent "
        + "    JOIN pg_class cl2 "
        + "      ON cl2.oid = con.conrelid) AS fk "
        + "  ON col.TABLE_NAME = fk.TABLE_NAME "
        + "  AND col.TABLE_SCHEMA = fk.TABLE_SCHEMA "
        + "  AND col.COLUMN_NAME = fk.COLUMN_NAME "
        + "WHERE col.TABLE_SCHEMA = $1::text "
        + "AND col.TABLE_CATALOG = $2::text "
        + "ORDER BY col.TABLE_NAME, col.ORDINAL_POSITION;";

    var request = new Request(sqlStr,
        [self.options.owner || self.options.userName, self.options.options.database || self.options.userName]);

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
    });
  };

  module.exports = MySqlAnalyzer;
});
