const jestAjv = require("jest-ajv");
const schema = require("./schema");

const RequestInput = (require('../../db/DbRequestInput'));
const MsSqlManager = require("../../mssql/MsSqlManager");
const options = {
  owner: "test_user",
  userName: "test_user",
  password: "password01@",
  server: "127.0.0.1",
  options: {
    port: 1433,
    database: "test",
    rowCollectionOnRequestCompletion: true
  }
};

describe('Wrong connection options', () => {
  let manager = null;

  test("Wrong user", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.userName = "dummy";
    const request = {
      id: "1",
      sql: "SELECT 1",
      inputs: []
    };
    const manager = new MsSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(request))
        .rejects
        .toMatchObject({message: "Login failed for user '" + wrongOptions.userName + "'."});
  });

  test("Wrong password", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.password = "passwor";
    const request = {
      id: "1",
      sql: "SELECT 1",
      inputs: []
    };
    manager = new MsSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(request))
        .rejects
        .toMatchObject({message: "Login failed for user '" + wrongOptions.userName + "'."});
  });

  test("Wrong database", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.options.database = "dummyDB";
    const request = {
      id: "1",
      sql: "SELECT 1",
      inputs: []
    };
    const manager = new MsSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(request))
        .rejects
        .toMatchObject({message: "Login failed for user '" + wrongOptions.userName + "'."});
  });

  test("Wrong server name", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.server = "my.example.org";
    const request = {
      id: "1",
      sql: "SELECT 1",
      inputs: []
    };
    manager = new MsSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(request))
        .rejects
        .toMatchObject({message: "Failed to connect to " + wrongOptions.server + ":" + wrongOptions.options.port + " - getaddrinfo ENOTFOUND " + wrongOptions.server});
  });

  // test("Wrong server IP", () => {
  //   const wrongOptions = JSON.parse(JSON.stringify(options));
  //   wrongOptions.server = "10.0.0.2";
  //   const request = {
  //     id: "1",
  //     sql: "SELECT 1",
  //     inputs: []
  //   };
  //   manager = new MsSqlManager(wrongOptions);
  //
  //   expect.assertions(1);
  //   return expect(manager.executeSql(request))
  //       .rejects
  //       .toMatchObject({message: "connect ETIMEDOUT " + wrongOptions.server + ":" + wrongOptions.options.port});
  // });

  test("Wrong server port", () => {
    const wrongOptions = JSON.parse(JSON.stringify(options));
    wrongOptions.options.port = 54321;
    const request = {
      id: "1",
      sql: "SELECT 1",
      inputs: []
    };
    manager = new MsSqlManager(wrongOptions);

    expect.assertions(1);
    return expect(manager.executeSql(request))
        .rejects
        .toMatchObject({message: "Failed to connect to " + wrongOptions.server + ":" + wrongOptions.options.port
          + " - connect ECONNREFUSED " + wrongOptions.server + ":" + wrongOptions.options.port});
  });
});


describe('MSSQL DB content', () => {
  let manager = null;

  beforeEach(() => {
    manager = new MsSqlManager(options);
  });

  afterEach(() => {
    manager.closeAllConnections();
  });

  test("MSSQL DB content", () => {
    const sqlStr = "SELECT col.TABLE_CATALOG AS table_catalog, "
        + "  col.TABLE_SCHEMA AS owner, "
        + "  col.TABLE_NAME AS table_name, "
        + "  col.COLUMN_NAME AS column_name, "
        + "  col.ORDINAL_POSITION AS ordinal_position, "
        + "  col.COLUMN_DEFAULT AS default_setting, "
        + "  col.DATA_TYPE AS data_type, "
        + "  col.CHARACTER_MAXIMUM_LENGTH AS max_length, "
        + "  col.DATETIME_PRECISION AS date_precision, "
        + "  CAST(CASE col.IS_NULLABLE WHEN 'NO' THEN 0 ELSE 1 END AS tinyint) AS is_nullable, "
        + "  COLUMNPROPERTY(OBJECT_ID('[' + col.TABLE_SCHEMA + '].[' + col.TABLE_NAME + ']'), col.COLUMN_NAME, 'is_identity') AS IsIdentity, "
        + "  COLUMNPROPERTY(OBJECT_ID('[' + col.TABLE_SCHEMA + '].[' + col.TABLE_NAME + ']'), col.COLUMN_NAME, 'is_computed') AS IsComputed, "
        + "  CAST(ISNULL(pk.is_primary_key, 0) AS tinyint) AS is_primary_key, "
        + "  CAST(ISNULL(uk.is_unique, 0) AS tinyint) AS is_unique, "
        + "  CAST(CASE WHEN fk.FK_NAME IS NULL THEN 0 ELSE 1 END AS tinyint) AS is_foreign_key, "
        + "  fk.FK_NAME AS foreign_key_name, "
        + "  fk.REFERENCED_TABLE_NAME AS referenced_table_name, "
        + "  fk.REFERENCED_COLUMN_NAME AS referenced_column_name, "
        + "  tbl.TABLE_DESCRIPTION AS table_description, "
        + "  description.COLUMN_DESCRIPTION AS column_description "
        + "FROM INFORMATION_SCHEMA.COLUMNS as col "
        + "  LEFT JOIN ( "
        + "    SELECT SCHEMA_NAME(o.schema_id) AS TABLE_SCHEMA, "
        + "      o.name                   AS TABLE_NAME, "
        + "      e.value                  AS TABLE_DESCRIPTION "
        + "  FROM sys.extended_properties e "
        + "    INNER JOIN sys.objects o "
        + "      ON e.major_id = o.object_id "
        + "      AND e.minor_id = 0 "
        + "  WHERE e.name = 'MS_Description' "
        + "    AND o.type = 'U' "
        + "  ) AS tbl "
        + "  ON col.TABLE_NAME = tbl.TABLE_NAME "
        + "  AND col.TABLE_SCHEMA = tbl.TABLE_SCHEMA "
        + "  LEFT JOIN ( "
        + "    SELECT SCHEMA_NAME(o.schema_id) AS TABLE_SCHEMA, "
        + "      o.name                        AS TABLE_NAME, "
        + "      c.name                        AS COLUMN_NAME, "
        + "      e.value                       AS COLUMN_DESCRIPTION "
        + "    FROM sys.extended_properties e "
        + "      INNER JOIN sys.objects o "
        + "        ON e.major_id = o.object_id "
        + "      LEFT OUTER JOIN sys.columns c "
        + "        ON o.object_id = c.object_id "
        + "        AND e.minor_id = c.column_id "
        + "    WHERE e.name = 'MS_Description' "
        + "      AND o.type = 'U' "
        + "  ) AS description "
        + "  ON col.TABLE_NAME = description.TABLE_NAME "
        + "  AND col.TABLE_SCHEMA = description.TABLE_SCHEMA "
        + "  AND col.COLUMN_NAME = description.COLUMN_NAME "
        + "  LEFT JOIN( "
        + "    SELECT SCHEMA_NAME(o.schema_id)AS TABLE_SCHEMA, "
        + "      o.name AS TABLE_NAME, "
        + "      c.name AS COLUMN_NAME, "
        + "      i.is_primary_key "
        + "    FROM sys.indexes AS i "
        + "      JOIN sys.index_columns AS ic "
        + "        ON i.object_id = ic.object_id "
        + "        AND i.index_id = ic.index_id "
        + "      JOIN sys.objects AS o "
        + "        ON i.object_id = o.object_id "
        + "      LEFT JOIN sys.columns AS c "
        + "        ON ic.object_id = c.object_id "
        + "        AND c.column_id = ic.column_id "
        + "    WHERE i.is_primary_key = 1) AS pk "
        + "  ON col.TABLE_NAME = pk.TABLE_NAME "
        + "  AND col.TABLE_SCHEMA = pk.TABLE_SCHEMA "
        + "  AND col.COLUMN_NAME = pk.COLUMN_NAME "
        + "  LEFT JOIN( "
        + "    SELECT DISTINCT tab.[name] AS TABLE_NAME, "
        + "      allc.[name] AS COLUMN_NAME, "
        + "      idx.is_unique "
        + "    FROM sys.[tables] as tab "
        + "      INNER JOIN sys.[indexes] AS idx "
        + "        ON tab.[object_id] = idx.[object_id] "
        + "      INNER JOIN sys.[index_columns] AS idxc "
        + "        ON idx.[object_id] = idxc.[object_id] "
        + "        AND idx.[index_id] = idxc.[index_id] "
        + "      INNER JOIN sys.[all_columns] AS allc "
        + "        ON tab.[object_id] = allc.[object_id] "
        + "        AND idxc.[column_id] = allc.[column_id] "
        + "    WHERE idx.is_unique = 1 "
        + "      AND idx.is_primary_key = 0) AS uk "
        + "  ON col.TABLE_NAME = uk.TABLE_NAME "
        + "  AND col.COLUMN_NAME = uk.COLUMN_NAME "
        + "  LEFT JOIN("
        + "    SELECT obj.name AS FK_NAME, "
        + "      sch.name AS TABLE_SCHEMA, "
        + "      tab1.name AS TABLE_NAME, "
        + "      col1.name AS COLUMN_NAME, "
        + "      tab2.name AS REFERENCED_TABLE_NAME, "
        + "      col2.name AS REFERENCED_COLUMN_NAME "
        + "    FROM sys.foreign_key_columns AS fkc "
        + "      INNER JOIN sys.objects AS obj "
        + "        ON obj.object_id = fkc.constraint_object_id "
        + "      INNER JOIN sys.tables AS tab1 "
        + "        ON tab1.object_id = fkc.parent_object_id "
        + "      INNER JOIN sys.schemas AS sch "
        + "        ON tab1.schema_id = sch.schema_id "
        + "      INNER JOIN sys.columns AS col1 "
        + "        ON col1.column_id = parent_column_id "
        + "        AND col1.object_id = tab1.object_id "
        + "      INNER JOIN sys.tables AS tab2 "
        + "        ON tab2.object_id = fkc.referenced_object_id "
        + "      INNER JOIN sys.columns AS col2 "
        + "        ON col2.column_id = referenced_column_id "
        + "        AND col2.object_id = tab2.object_id) AS fk "
        + "  ON col.TABLE_NAME = fk.TABLE_NAME "
        + "  AND col.TABLE_SCHEMA = fk.TABLE_SCHEMA "
        + "  AND col.COLUMN_NAME = fk.COLUMN_NAME "
        + "WHERE col.TABLE_SCHEMA = @owner "
        + "ORDER BY col.TABLE_NAME, col.ORDINAL_POSITION;";

    const requestInput = new RequestInput('owner', 'varchar', options.owner || options.userName);
    const request = {id: "1", sql: sqlStr, inputs: [requestInput]};

    expect.assertions(1);
    return manager.executeSql(request)
        .then(data => expect(data).toMatchSchema(schema));
  });

  test("MSSQL DB content with wrong prepared statement parameter", () => {
    const sqlStr = "SELECT * "
        + "FROM INFORMATION_SCHEMA.COLUMNS as col "
        + "WHERE col.TABLE_SCHEMA = @owner "
        + "ORDER BY col.TABLE_NAME, col.ORDINAL_POSITION;";

    const requestInput = new RequestInput('owner', 'varchar', options.owner || options.userName);
    const request = {id: "1", sql: sqlStr, inputs: []};

    expect.assertions(1);
    return manager.executeSql(request)
        .catch(err => expect(err).toMatchObject({message: "Must declare the scalar variable \"@" + requestInput.name + "\"."}));
        // .rejects
        // .toMatchObject({message: "Must declare the scalar variable \"@owner\""});
  });
});
