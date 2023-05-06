const Request = require("../db/DbRequest");
const DbAnalyzer = require("../db/DbAnalyzer");
const Manager = require("./PostgreSqlManager");

class MySqlAnalyzer extends DbAnalyzer {
    /**
     * MySqlAnalyzer
     *
     * @constructor
     */
    constructor(options, model) {
        super(options, model, new Manager(options));
    }

    analyze() {
        const sqlStr = "SELECT col.TABLE_CATALOG AS table_catalog, "
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
            + "  fk.REFERENCED_COLUMN_NAME AS referenced_column_name, "
            + "  obj_description(cls.oid) AS table_description, "
            + "  col_description(cls.oid, col.ordinal_position::int) AS column_description "
            + "FROM INFORMATION_SCHEMA.COLUMNS as col "
            + "  LEFT JOIN pg_class cls "
            + "    ON col.table_name = cls.relname "
            + "    AND col.table_schema = cls.relnamespace::regnamespace::text "
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

        const request = new Request(sqlStr, [this.options.owner, this.options.options.database || this.options.userName]);
        return this.executeSql(request);
    };
}

module.exports = MySqlAnalyzer;
