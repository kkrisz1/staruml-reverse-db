/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var OperationBuilder = app.getModule("core/OperationBuilder");
  var Repository = app.getModule("core/Repository");
  var ProjectManager = app.getModule("engine/ProjectManager");

  var ProjectWriter = require("util/ProjectWriter");
  var Request = require("mysql/Manager").Request;
  var RequestInput = require("mysql/Manager").RequestInput;
  var Manager = require("mysql/Manager").Manager;

  var ErDmBuilder = require("erd/ErDmBuilder");


  /**
   * Database Schema Analyzer
   * @constructor
   */
  function DbAnalyzer(options, model) {
    /**
     * @private
     * @member {object}
     */
    this.options = options;

    /**
     * @private
     * @member {ErDmBuilder}
     */
    this.erDmBuilder = new ErDmBuilder(model);

    /**
     * @private
     * @member {type.ERDEntity}
     */
    this.currentEntity = null;

    /**
     * @private
     * @member {Array}
     */
    this.pendingReferences = [];

    /**
     * @private
     * @member {ProjectWriter}
     */
    this.projectWriter = new ProjectWriter(model);
  }


  DbAnalyzer.prototype.analyze = function () {
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
        + "  CAST(CASE col.IS_NULLABLE WHEN 'NO' THEN 0 ELSE 1 END AS unsigned) AS is_nullable "
        // + "  CAST(ISNULL(pk.is_primary_key, 0) AS unsigned) AS is_primary_key, "
        // + "  CAST(ISNULL(uk.is_unique, 0) AS unsigned) AS is_unique, "
        // + "  CAST(CASE WHEN fk.FK_NAME IS NULL THEN 0 ELSE 1 END AS unsigned) AS is_foreign_key, "
        // + "  fk.FK_NAME AS foreign_key_name, "
        // + "  fk.REFERENCED_TABLE_NAME AS referenced_table_name, "
        // + "  fk.REFERENCED_COLUMN_NAME AS referenced_column_name "
        + "FROM INFORMATION_SCHEMA.COLUMNS as col "
        // + "  LEFT JOIN( "
        // + "    SELECT SCHEMA_NAME(o.schema_id)AS TABLE_SCHEMA, "
        // + "      o.name AS TABLE_NAME, "
        // + "      c.name AS COLUMN_NAME, "
        // + "      i.is_primary_key "
        // + "    FROM sys.indexes AS i "
        // + "      JOIN sys.index_columns AS ic "
        // + "        ON i.object_id = ic.object_id "
        // + "        AND i.index_id = ic.index_id "
        // + "      JOIN sys.objects AS o "
        // + "        ON i.object_id = o.object_id "
        // + "      LEFT JOIN sys.columns AS c "
        // + "        ON ic.object_id = c.object_id "
        // + "        AND c.column_id = ic.column_id "
        // + "    WHERE i.is_primary_key = 1) AS pk "
        // + "  ON col.TABLE_NAME = pk.TABLE_NAME "
        // + "  AND col.TABLE_SCHEMA = pk.TABLE_SCHEMA "
        // + "  AND col.COLUMN_NAME = pk.COLUMN_NAME "
        // + "  LEFT JOIN( "
        // + "    SELECT DISTINCT tab.[name] AS TABLE_NAME, "
        // + "      allc.[name] AS COLUMN_NAME, "
        // + "      idx.is_unique "
        // + "    FROM sys.[tables] as tab "
        // + "      INNER JOIN sys.[indexes] AS idx "
        // + "        ON tab.[object_id] = idx.[object_id] "
        // + "      INNER JOIN sys.[index_columns] AS idxc "
        // + "        ON idx.[object_id] = idxc.[object_id] "
        // + "        AND idx.[index_id] = idxc.[index_id] "
        // + "      INNER JOIN sys.[all_columns] AS allc "
        // + "        ON tab.[object_id] = allc.[object_id] "
        // + "        AND idxc.[column_id] = allc.[column_id] "
        // + "    WHERE idx.is_unique = 1 "
        // + "      AND idx.is_primary_key = 0) AS uk "
        // + "  ON col.TABLE_NAME = uk.TABLE_NAME "
        // + "  AND col.COLUMN_NAME = uk.COLUMN_NAME "
        // + "  LEFT JOIN("
        // + "    SELECT obj.name AS FK_NAME, "
        // + "      sch.name AS TABLE_SCHEMA, "
        // + "      tab1.name AS TABLE_NAME, "
        // + "      col1.name AS COLUMN_NAME, "
        // + "      tab2.name AS REFERENCED_TABLE_NAME, "
        // + "      col2.name AS REFERENCED_COLUMN_NAME "
        // + "    FROM sys.foreign_key_columns AS fkc "
        // + "      INNER JOIN sys.objects AS obj "
        // + "        ON obj.object_id = fkc.constraint_object_id "
        // + "      INNER JOIN sys.tables AS tab1 "
        // + "        ON tab1.object_id = fkc.parent_object_id "
        // + "      INNER JOIN sys.schemas AS sch "
        // + "        ON tab1.schema_id = sch.schema_id "
        // + "      INNER JOIN sys.columns AS col1 "
        // + "        ON col1.column_id = parent_column_id "
        // + "        AND col1.object_id = tab1.object_id "
        // + "      INNER JOIN sys.tables AS tab2 "
        // + "        ON tab2.object_id = fkc.referenced_object_id "
        // + "      INNER JOIN sys.columns AS col2 "
        // + "        ON col2.column_id = referenced_column_id "
        // + "        AND col2.object_id = tab2.object_id) AS fk "
        // + "  ON col.TABLE_NAME = fk.TABLE_NAME "
        // + "  AND col.TABLE_SCHEMA = fk.TABLE_SCHEMA "
        // + "  AND col.COLUMN_NAME = fk.COLUMN_NAME "
        // + "WHERE col.TABLE_SCHEMA = 'user' "
        + "WHERE col.TABLE_SCHEMA = ? "
        + "ORDER BY col.TABLE_NAME, col.ORDINAL_POSITION;";

    return self.executeSql(sqlStr, function () {
    }, function (rowCount, rows) {
      OperationBuilder.begin("Generate ER Data Model");
      rows.forEach(function (row) {
        self.performFirstPhase(row);
      });
      self.performSecondPhase();
      OperationBuilder.end();
      Repository.doOperation(OperationBuilder.getOperation());
    })
  };


  DbAnalyzer.prototype.executeSql = function (sql, handleRowReceived, handleStatementComplete) {
    var self = this;

    var request = new Request(sql, [self.options.owner || self.options.options.database || self.options.userName]);
    var manager = new Manager(request, self.options);

    return manager.executeSql(handleRowReceived, handleStatementComplete);
  };


  /**
   * Perform first phase:
   *   - get entity if exists, otherwise create a new one
   *   - create a column of the got/created entity
   *   - create relationship if there is a reference to another entity
   * @param {Object} element
   */
  DbAnalyzer.prototype.performFirstPhase = function (element) {
    var self = this;

    var entityName = element.table_name;
    if (!self.currentEntity || self.currentEntity.name !== entityName) {
      self.currentEntity = self.erDmBuilder.createErdEntity(entityName);
      self.erDmBuilder.addErdEntity(self.currentEntity);
    }

    // var column = self.erDmBuilder.createErdColumn(self.currentEntity, element,
    //     function (column, foreignKeyName, refEntityName, refColumnName) {
    //       var notFoundRef = {
    //         column: column,
    //         foreignKeyName: foreignKeyName,
    //         refEntityName: refEntityName,
    //         refColumnName: refColumnName
    //       };
    //       self.pendingReferences.push(notFoundRef);
    //     }, function (columnProperty) {
    //       return columnProperty.value;
    //     });
    // self.erDmBuilder.addErdColumn(self.currentEntity, column);

    // if (column.foreignKey && column.referenceTo) {
    //   self.addOrSetErdRelationship(self.currentEntity, column, column.referenceTo,
    //       element.foreign_key_name);
    // }
  };


  /**
   * Perform the second phase
   *   - proceed pending references
   *   - generate ER Data Model
   *   - generate empty ER Diagram
   */
  DbAnalyzer.prototype.performSecondPhase = function () {
    var self = this;

    self.proceedPendingReferences();
    self.projectWriter.generateModel();
  };


  /**
   * Create or set (if it exists) a relationship
   * @param {type.ERDEntity} namespace
   * @param {type.ERDColumn} elementFrom
   * @param {type.ERDColumn} elementTo
   * @param {string} name
   * @throws {Error} 'elementFrom' is not a foreign key or 'elementTo' is undefined
   */
  DbAnalyzer.prototype.addOrSetErdRelationship = function (namespace, elementFrom, elementTo, name) {
    if (!elementFrom.foreignKey) {
      throw new Error("'elementFrom' is not a foreign key ");
    }
    if (!elementTo) {
      throw new Error("'elementTo' is undefined");
    }

    var self = this;
    var relationship = namespace.findByName(name);

    if (!relationship) {
      relationship = self.erDmBuilder.createErdRelationship(namespace, elementFrom, elementTo, name);
      self.erDmBuilder.addErdRelationship(namespace, relationship);
    } else {
      relationship.end2.name += ", " + elementFrom.name;
    }
  };


  /**
   * Proceed pending references
   */
  DbAnalyzer.prototype.proceedPendingReferences = function () {
    var self = this;

    self.pendingReferences.forEach(function (pendingReference) {
      pendingReference.column.referenceTo = self.erDmBuilder.createReference(pendingReference.column,
          pendingReference.foreignKeyName, pendingReference.refEntityName, pendingReference.refColumnName,
          function (column, foreignKeyName, refEntityName, refColumnName) {
            console.warn("Reference '" + foreignKeyName + "' cannot be resolved!");
          });

      if (pendingReference.column.referenceTo) {
        self.addOrSetErdRelationship(pendingReference.column._parent, pendingReference.column,
            pendingReference.column.referenceTo, pendingReference.foreignKeyName);
      }
    });
  };


  /**
   * Analyze all columns of tables and their relationships under the given database
   * @param {Object} options
   * @param {type.ERDDataModel} model
   * @return {$.Promise} jqueryPromise
   */
  function analyze(options, model) {
    var result = new $.Deferred();
    result.notify({severity: "info", message: "ER Data Model generation has been started. Please wait..."});
    setTimeout(function () {
      if (result.state() === "pending") {
        result.notify({severity: "info", message: "ER Data Model generation is in progress... "});
      }
    }, 8000);

    if (!model) {
      model = new type.ERDDataModel();
      model._parent = ProjectManager.getProject() ? ProjectManager.getProject() : ProjectManager.newProject();
    }
    var dbAnalyzer = new DbAnalyzer(options, model);
    dbAnalyzer.analyze()
        .then(function () {
          result.notify({severity: "info", message: "ER Data Model generation has been finished."});
          result.resolve();
        }, function (err) {
          result.notify({severity: "error", message: "Error occurred!"});
          result.reject(err);
        })
        .always(function () {
          // When StarUML closed or NodeJS server is restarted then all connections are closed
        });

    return result.promise();
  }

  exports.analyze = analyze;
});
