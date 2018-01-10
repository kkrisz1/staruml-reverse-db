/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";


  /**
   * ER Data Model Builder
   * @param {type.ERDDataModel} model
   * @constructor
   */
  function ErDmBuilder(model) {
    /**
     * @private
     * @member {type.ERDDataModel}
     */
    this._root = model;
  }


  ErDmBuilder.prototype.getErDataModel = function () {
    var self = this;

    return self._root;
  };


  /**
   * Create an entity
   * @param {string} name
   * @return {type.ERDEntity} entity
   */
  ErDmBuilder.prototype.createErdEntity = function (name) {
    var self = this;
    var entity = new type.ERDEntity();

    entity._parent = self._root;
    entity.name = name;

    return entity;
  };


  /**
   * Create a column
   * @param {type.ERDEntity} namespace
   * @param {Object} element
   * @param {Function} handleRefNotFound
   * @param {Function} columnPropertyMapper
   * @return {type.ERDColumn} column
   */
  ErDmBuilder.prototype.createErdColumn = function (namespace, element, handleRefNotFound, columnPropertyMapper) {
    var self = this;
    var column = new type.ERDColumn();

    if (columnPropertyMapper === undefined) {
      columnPropertyMapper = function (columnProperty) {
        return columnProperty;
      }
    }

    column._parent = namespace;
    column.name = columnPropertyMapper(element.column_name);
    column.primaryKey = columnPropertyMapper(element.is_primary_key);
    column.nullable = columnPropertyMapper(element.is_nullable);
    column.unique = columnPropertyMapper(element.is_unique);
    column.type = columnPropertyMapper(element.data_type).toUpperCase();
    column.length = columnPropertyMapper(element.max_length) ? columnPropertyMapper(element.max_length).toString() : "";
    column.foreignKey = columnPropertyMapper(element.is_foreign_key);
    column.referenceTo = column.foreignKey
        ? self.createReference(column,
            columnPropertyMapper(element.foreign_key_name),
            columnPropertyMapper(element.referenced_table_name),
            columnPropertyMapper(element.referenced_column_name),
            handleRefNotFound)
        : undefined;

    return column;
  };


  /**
   * If the referred column(s) exist(s) then create a reference to the referred column
   * Otherwise store the information about the referred column for further proceeding
   * @param {type.ERDColumn} column
   * @param {string} foreignKeyName
   * @param {string} refEntityName
   * @param {string} refColumnName
   * @param {Function} handleRefNotFound
   * @throws {Error} 'column' is not a foreign key
   * @return {type.ERDColumn} referenceTo
   */
  ErDmBuilder.prototype.createReference = function (column, foreignKeyName, refEntityName, refColumnName, handleRefNotFound) {
    if (!column.foreignKey) {
      throw new Error("The column is not a foreign key!");
    }

    var self = this;

    var referredEntity = self._root.findByName(refEntityName);
    if (!referredEntity) {
      handleRefNotFound(column, foreignKeyName, refEntityName, refColumnName);
      return undefined;
    }

    var referenceTo = referredEntity.findByName(refColumnName);
    if (!referenceTo) {
      handleRefNotFound(column, foreignKeyName, refEntityName, refColumnName);
      return undefined;
    }

    return referenceTo;
  };


  /**
   * Create a relationship
   * @param {type.ERDEntity} namespace
   * @param {type.ERDColumn} elementFrom
   * @param {type.ERDColumn} elementTo
   * @param {string} name
   * @throws {Error} 'elementFrom' is not a foreign key
   * @return {type.ERDRelationship} relationship
   */
  ErDmBuilder.prototype.createErdRelationship = function (namespace, elementFrom, elementTo, name) {
    if (!elementFrom.foreignKey) {
      throw new Error("The starting point of the relation is not a foreign key!");
    }

    var self = this;

    return self.createErdRelationshipWithoutCheck(namespace, elementFrom, elementTo, name);
  };


  /**
   * Create a relationship
   * @param {type.ERDEntity} namespace
   * @param {type.ERDColumn} elementFrom
   * @param {type.ERDColumn} elementTo
   * @param {string} name
   * @return {type.ERDRelationship} relationship
   */
  ErDmBuilder.prototype.createErdRelationshipWithoutCheck = function (namespace, elementFrom, elementTo, name) {
    var self = this;
    var relationship = new type.ERDRelationship();

    relationship._parent = namespace;
    relationship.name = name;
    relationship.identifying = true;
    relationship.end1 = self.createErdRelationshipEnd(relationship, elementFrom, "",
        elementFrom.unique ? "0..1" : "0..*");
    relationship.end2 = self.createErdRelationshipEnd(relationship, elementTo, elementFrom.name,
        elementFrom.nullable ? "0..1" : "1");

    return relationship;
  };


  /**
   * Create a relationship end
   * @param {type.ERDRelationship} namespace
   * @param {type.ERDColumn} element
   * @param {string} name
   * @param {string} cardinality
   * @return {type.ERDRelationshipEnd} end of the relationship
   */
  ErDmBuilder.prototype.createErdRelationshipEnd = function (namespace, element, name, cardinality) {
    var relationshipEnd = new type.ERDRelationshipEnd();

    relationshipEnd._parent = namespace;
    relationshipEnd.name = name;
    relationshipEnd.identifying = true;
    relationshipEnd.cardinality = cardinality;
    relationshipEnd.reference = element._parent;

    return relationshipEnd;
  };


  /**
   * Add an entity to the DataModel
   * @param {type.ERDEntity} element
   */
  ErDmBuilder.prototype.addErdEntity = function (element) {
    var self = this;

    self._root.ownedElements.push(element);
  };


  /**
   * Add a column to the entity
   * @param {type.ERDEntity} namespace
   * @param {type.ERDColumn} element
   */
  ErDmBuilder.prototype.addErdColumn = function (namespace, element) {
    namespace.columns.push(element);
  };


  /**
   * Add a relationship to the entity
   * @param {type.ERDEntity} namespace
   * @param {type.ERDRelationship} element
   */
  ErDmBuilder.prototype.addErdRelationship = function (namespace, element) {
    namespace.ownedElements.push(element);
  };

  module.exports = ErDmBuilder;
});