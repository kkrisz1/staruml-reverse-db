/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var OperationBuilder = app.getModule("core/OperationBuilder");
  var Repository = app.getModule("core/Repository");
  var ProjectManager = app.getModule("engine/ProjectManager");
  // var Async = app.getModule("utils/Async");

  var ProjectWriter = require("util/ProjectWriter");
  var Request = require("postgresql/Manager").Request;
  var Manager = require("postgresql/Manager").Manager;

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
        + "  CAST(CASE WHEN pk.is_unique THEN 1 ELSE 0 END AS bit) AS is_unique "
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
        + "WHERE col.TABLE_SCHEMA = $1::text "
        + "AND col.TABLE_CATALOG = $2::text "
        + "ORDER BY col.TABLE_NAME, col.ORDINAL_POSITION;";

    return self.executeSql(sqlStr, function (row) {
    }, function (rowCount, rows) {
      OperationBuilder.begin("Generate ER Data Model");
      // var result = new $.Deferred();
      // Async.doInParallel_aggregateErrors(rows,
      //     function (row) {
      //       return self.performFirstPhase(row);
      //     })
      //     .then(result.resolve, function () {
      //       result.reject(new Error("Error occurred during creation of ER Data Model!"));
      //     });
      rows.forEach(function (row) {
        self.performFirstPhase(row);
      });
      self.performSecondPhase();
      OperationBuilder.end();
      Repository.doOperation(OperationBuilder.getOperation());
    });
  };


  DbAnalyzer.prototype.executeSql = function (sql, handleRowReceived, handleStatementComplete) {
    var self = this;
    var requestInputs = [self.options.owner || self.options.userName,
      self.options.options.database || self.options.userName];
    var request = new Request(sql, requestInputs);
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
    // var result = new $.Deferred();
    var self = this;

    // try {
    var entityName = element.table_name;
    if (!self.currentEntity || self.currentEntity.name !== entityName) {
      self.currentEntity = self.erDmBuilder.createErdEntity(entityName);
      self.erDmBuilder.addErdEntity(self.currentEntity);
    }

    var column = self.erDmBuilder.createErdColumn(self.currentEntity, element,
        function (column, foreignKeyName, refEntityName, refColumnName) {
          var notFoundRef = {
            column: column,
            foreignKeyName: foreignKeyName,
            refEntityName: refEntityName,
            refColumnName: refColumnName
          };
          self.pendingReferences.push(notFoundRef);
        });
    self.erDmBuilder.addErdColumn(self.currentEntity, column);

    // if (column.foreignKey && column.referenceTo) {
    //   self.addOrSetErdRelationship(self.currentEntity, column, column.referenceTo,
    //       element.foreign_key_name.value);
    // }
    //   result.resolve();
    // } catch (e) {
    //   result.reject(e);
    // }
    //
    // result.promise();
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
          return new Manager().closeAllConnections();
        });

    return result.promise();
  }

  exports.analyze = analyze;
});
