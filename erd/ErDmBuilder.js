class ErDmBuilder {
  /**
   * ER Data Model Builder
   *
   * @param {type.ERDDataModel} model
   * @constructor
   */
  constructor(model) {
    /**
     * @private
     * @member {type.ERDDataModel}
     */
    this._root = model;
  }

  /**
   * Create an entity
   *
   * @param {string} name
   * @return {type.ERDEntity} entity
   */
  createErdEntity(name) {
    const entity = new type.ERDEntity();

    entity._parent = this._root;
    entity.name = name;

    return entity;
  };


  /**
   * Create a column
   *
   * @param {type.ERDEntity} namespace
   * @param {Object} element
   * @param {Function} handleRefNotFound
   * @return {type.ERDColumn} column
   */
  createErdColumn(namespace, element, handleRefNotFound) {
    const column = new type.ERDColumn();

    column._parent = namespace;
    column.name = element.column_name;
    column.primaryKey = Boolean(element.is_primary_key);
    column.nullable = Boolean(element.is_nullable);
    column.unique = !column.primaryKey && Boolean(element.is_unique);
    column.type = element.data_type.toUpperCase();
    column.length = element.max_length ? element.max_length.toString() : "";
    column.foreignKey = Boolean(element.is_foreign_key);
    column.referenceTo = column.foreignKey
        ? this.createReference(column,
            element.foreign_key_name,
            element.referenced_table_name,
            element.referenced_column_name,
            handleRefNotFound)
        : undefined;

    return column;
  };


  /**
   * If the referred column(s) exist(s) then create a reference to the referred column
   * Otherwise store the information about the referred column for further proceeding
   *
   * @param {type.ERDColumn} column
   * @param {string} foreignKeyName
   * @param {string} refEntityName
   * @param {string} refColumnName
   * @param {Function} handleRefNotFound
   * @throws {Error} 'column' is not a foreign key
   * @return {type.ERDColumn} referenceTo
   */
  createReference(column, foreignKeyName, refEntityName, refColumnName, handleRefNotFound) {
    if (!column.foreignKey) {
      throw new Error("The column is not a foreign key!");
    }

    const referredEntity = this._root.findByName(refEntityName);
    if (!referredEntity) {
      handleRefNotFound(column, foreignKeyName, refEntityName, refColumnName);
      return undefined;
    }

    const referenceTo = referredEntity.findByName(refColumnName);
    if (!referenceTo) {
      handleRefNotFound(column, foreignKeyName, refEntityName, refColumnName);
      return undefined;
    }

    return referenceTo;
  };


  /**
   * Create a relationship
   *
   * @param {type.ERDEntity} namespace
   * @param {type.ERDColumn} elementFrom
   * @param {type.ERDColumn} elementTo
   * @param {string} name
   * @throws {Error} 'elementFrom' is not a foreign key
   * @return {type.ERDRelationship} relationship
   */
  createErdRelationship(namespace, elementFrom, elementTo, name) {
    if (!elementFrom.foreignKey) {
      throw new Error("The starting point of the relation is not a foreign key!");
    }

    return this.createErdRelationshipWithoutCheck(namespace, elementFrom, elementTo, name);
  };


  /**
   * Create a relationship
   *
   * @param {type.ERDEntity} namespace
   * @param {type.ERDColumn} elementFrom
   * @param {type.ERDColumn} elementTo
   * @param {string} name
   * @return {type.ERDRelationship} relationship
   */
  createErdRelationshipWithoutCheck(namespace, elementFrom, elementTo, name) {
    const relationship = new type.ERDRelationship();

    relationship._parent = namespace;
    relationship.name = name;
    relationship.identifying = true;
    relationship.end1 = this.createErdRelationshipEnd(relationship, elementFrom, "",
        elementFrom.unique ? "0..1" : "0..*");
    relationship.end2 = this.createErdRelationshipEnd(relationship, elementTo, elementFrom.name,
        elementFrom.nullable ? "0..1" : "1");

    return relationship;
  };


  /**
   * Create a relationship end
   *
   * @param {type.ERDRelationship} namespace
   * @param {type.ERDColumn} element
   * @param {string} name
   * @param {string} cardinality
   * @return {type.ERDRelationshipEnd} end of the relationship
   */
  createErdRelationshipEnd(namespace, element, name, cardinality) {
    const relationshipEnd = new type.ERDRelationshipEnd();

    relationshipEnd._parent = namespace;
    relationshipEnd.name = name;
    relationshipEnd.identifying = true;
    relationshipEnd.cardinality = cardinality;
    relationshipEnd.reference = element._parent;

    return relationshipEnd;
  };


  /**
   * Add an entity to the DataModel
   *
   * @param {type.ERDEntity} element
   */
  addErdEntity(element) {
    this._root.ownedElements.push(element);
  };


  /**
   * Add a column to the entity
   *
   * @param {type.ERDEntity} namespace
   * @param {type.ERDColumn} element
   */
  addErdColumn(namespace, element) {
    namespace.columns.push(element);
  };


  /**
   * Add a relationship to the entity
   *
   * @param {type.ERDEntity} namespace
   * @param {type.ERDRelationship} element
   */
  addErdRelationship(namespace, element) {
    namespace.ownedElements.push(element);
  };
}

module.exports = ErDmBuilder;
