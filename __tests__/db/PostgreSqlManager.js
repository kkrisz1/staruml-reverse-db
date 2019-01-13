const jestAjv = require("jest-ajv");
const schema = require("./schema");

const PostgreSqlManager = require("../../postgresql/PostgreSqlManager");

const options = {
  owner: "public",
  userName: "user",
  password: "password",
  server: "127.0.0.1",
  options: {
    port: 5432,
    database: "user",
    ssl: false
  }
};
const testRequest = {
  id: "1",
  sql: "SELECT 1",
  inputs: []
};

describe('Wrong connection options', () => {
  test("Wrong password", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.password = "passwor";
    const manager = new PostgreSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "password authentication failed for user \"" + wrongOptions.userName + "\""});
  });

  test("Wrong server name", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.server = "my.example.org";
    const manager = new PostgreSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "getaddrinfo ENOTFOUND " + wrongOptions.server + " " + wrongOptions.server + ":" + wrongOptions.options.port});
  });

  // test("Wrong server IP", () => {
  //   const wrongOptions = JSON.parse(JSON.stringify(options));
  //   wrongOptions.server = "10.0.0.2";
  //   const manager = new PostgreSqlManager(wrongOptions);
  //
  //   expect.assertions(1);
  //   return expect(manager.executeSql(testRequest))
  //       .rejects
  //       .toMatchObject({message: "connect ETIMEDOUT " + wrongOptions.server + ":" + wrongOptions.options.port});
  // });

  test("Wrong server port", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.options.port = 54321;
    const manager = new PostgreSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "connect ECONNREFUSED " + wrongOptions.server + ":" + wrongOptions.options.port});
  });

  test("Not existing database", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.options.database = "dummy";
    const manager = new PostgreSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "database \"" + wrongOptions.options.database + "\" does not exist"});
  });

  // test("SSL required database", () => {
  //   // NOTE: Recommended that the author setup a free hosted Postgres instance for testing valid SSL connections
  //   const wrongOptions = JSON.parse(JSON.stringify(options));
  //   // NOTE: public testing postgresql server that has ssl enabled
  //   wrongOptions.server = "";
  //   wrongOptions.options.ssl = false;
  //   const manager = new PostgreSqlManager(wrongOptions);

  //   expect.assertions(1);
  //   return expect(manager.executeSql(testRequest))
  //     .rejects
  //     .toMatchObject({mesesage: "no pg_hba.conf entry for host \"" + wrongOptions.server + "\", user \"" + wrongOptions.userName + "\", database \"" + wrongOptions.options.database + "\", SSL off"})
  // })
});


describe('PostgreSQL DB content', () => {
  let manager = null;

  beforeEach(() => {
    manager = new PostgreSqlManager(options);
  });

  afterEach(() => {
    manager.closeAllConnections();
  });

  test("PostgreSQL DB content", () => {
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
        + "  LEFT JOIN pg_class cls ON "
        + "    col.table_name = cls.relname"
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

    const request = {id: "1", sql: sqlStr, inputs: [options.owner, options.options.database || options.userName]};

    expect.assertions(1);
    return manager.executeSql(request)
        .then(data => expect(data).toMatchSchema(schema));
  });
});
