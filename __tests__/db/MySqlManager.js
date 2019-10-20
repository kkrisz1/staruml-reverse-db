const jestAjv = require("jest-ajv");
const schema = require("./schema");

const MySqlManager = require("../../mysql/MySqlManager");
const options = {
  owner: "user",
  userName: "user",
  password: "password",
  server: "127.0.0.1",
  options: {
    port: 3306,
    database: "def"
  }
};
const testRequest = {
  id: "1",
  sql: "SELECT 1",
  inputs: []
};

describe('Wrong connection options', () => {
  let manager = null;

  test("Wrong password", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.password = "passwor";
    manager = new MySqlManager(wrongOptions);

    // in case of docker, the server IP address is unpredictable
    const expectedMessage = "Access denied for user 'user'@'[a-z0-9.]+' \\(using password: YES\\)";
    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        // in case of docker, the server IP address is unpredictable
        // .toMatchObject({message: "Access denied for user '" + wrongOptions.userName + "'@'" + wrongOptions.server + "' (using password: YES)"});
        .toMatchObject(expect.objectContaining({
          message: expect.stringMatching(new RegExp(expectedMessage))
        }));
  });

  test("Wrong server name", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.server = "my.example.org";
    manager = new MySqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "getaddrinfo ENOTFOUND " + wrongOptions.server + " " + wrongOptions.server + ":" + wrongOptions.options.port});
  });

  // test("Wrong server IP", () => {
  //   const wrongOptions = JSON.parse(JSON.stringify(options));
  //   wrongOptions.server = "10.0.0.2";
  //   manager = new MySqlManager(wrongOptions);
  //
  //   expect.assertions(1);
  //   return expect(manager.executeSql(testRequest))
  //       .rejects
  //       .toMatchObject({message: "connect ETIMEDOUT " + wrongOptions.server + ":" + wrongOptions.options.port});
  // });

  test("Wrong server port", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.options.port = 54321;
    manager = new MySqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "connect ECONNREFUSED " + wrongOptions.server + ":" + wrongOptions.options.port});
  });

  test("Not existing database", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.owner = "dummy";
    const manager = new MySqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "Access denied for user '" + wrongOptions.userName + "'@'%' to database '" + wrongOptions.owner + "'"});
  });

  test("Not existing database as root", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.userName = "root";
    wrongOptions.password = "";
    wrongOptions.owner = "dummy";
    const manager = new MySqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(testRequest))
        .rejects
        .toMatchObject({message: "Unknown database '" + wrongOptions.owner + "'"});
  });
});


describe('MySQL DB content', () => {
  let manager = null;

  beforeEach(() => {
    manager = new MySqlManager(options);
  });

  afterEach(() => {
    manager.closeAllConnections();
  });

  test("MySQL DB content", () => {
    const sqlStr = "SELECT "
        + "  col.TABLE_CATALOG                                  AS table_catalog, "
        + "  col.TABLE_SCHEMA                                   AS owner, "
        + "  col.TABLE_NAME                                     AS table_name, "
        + "  col.COLUMN_NAME                                    AS column_name, "
        + "  col.ORDINAL_POSITION                               AS ordinal_position, "
        + "  col.COLUMN_DEFAULT                                 AS default_setting, "
        + "  col.DATA_TYPE                                      AS data_type, "
        + "  col.CHARACTER_MAXIMUM_LENGTH                       AS max_length, "
        + "  col.DATETIME_PRECISION                             AS date_precision, "
        + "  IF(col.IS_NULLABLE='NO', FALSE, TRUE)              AS is_nullable, "
        + "  IF(ks.CONSTRAINT_TYPE='PRIMARY KEY', TRUE, FALSE)  AS is_primary_key, "
        + "  IF(ks.CONSTRAINT_TYPE='UNIQUE', TRUE, FALSE)       AS is_unique, "
        + "  IF(fk.CONSTRAINT_TYPE='FOREIGN KEY', TRUE, FALSE)  AS is_foreign_key, "
        + "  fk.CONSTRAINT_NAME                                 AS foreign_key_name, "
        + "  fk.REFERENCED_TABLE_NAME                           AS referenced_table_name, "
        + "  fk.REFERENCED_COLUMN_NAME                          AS referenced_column_name, "
        + "  tbl.table_comment                                  AS table_description, "
        + "  col.column_comment                                 AS column_description "
        + "FROM INFORMATION_SCHEMA.COLUMNS AS col "
        + "  LEFT JOIN INFORMATION_SCHEMA.TABLES as tbl "
        + "  USING (TABLE_SCHEMA, TABLE_NAME)"
        + "  LEFT JOIN (SELECT "
        + "               k.TABLE_SCHEMA    AS TABLE_SCHEMA, "
        + "               k.TABLE_NAME      AS TABLE_NAME, "
        + "               k.COLUMN_NAME     AS COLUMN_NAME, "
        + "               t.CONSTRAINT_TYPE AS CONSTRAINT_TYPE, "
        + "               t.CONSTRAINT_NAME AS CONSTRAINT_NAME "
        + "             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS t "
        + "               JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS k "
        + "               USING (CONSTRAINT_NAME, TABLE_SCHEMA, TABLE_NAME) "
        + "             WHERE k.POSITION_IN_UNIQUE_CONSTRAINT IS NULL) AS ks "
        + "  USING (TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME) "
        + "  LEFT JOIN (SELECT "
        + "               k.TABLE_SCHEMA           AS TABLE_SCHEMA, "
        + "               k.TABLE_NAME             AS TABLE_NAME, "
        + "               k.COLUMN_NAME            AS COLUMN_NAME, "
        + "               t.CONSTRAINT_TYPE        AS CONSTRAINT_TYPE, "
        + "               t.CONSTRAINT_NAME        AS CONSTRAINT_NAME, "
        + "               k.REFERENCED_TABLE_NAME  AS REFERENCED_TABLE_NAME, "
        + "               k.REFERENCED_COLUMN_NAME AS REFERENCED_COLUMN_NAME "
        + "             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS k "
        + "               JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS t "
        + "               USING (CONSTRAINT_NAME, TABLE_SCHEMA, TABLE_NAME) "
        + "             WHERE k.POSITION_IN_UNIQUE_CONSTRAINT IS NOT NULL) AS fk "
        + "  USING (TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME) "
        + "WHERE col.TABLE_SCHEMA = ? AND col.TABLE_CATALOG = ? "
        + "ORDER BY col.TABLE_NAME, col.ORDINAL_POSITION;";

    const request = {id: "1", sql: sqlStr, inputs: [options.owner, options.options.database || options.userName]};

    expect.assertions(1);
    return manager.executeSql(request)
        .then(data => expect(data).toMatchSchema(schema));
  });
});
