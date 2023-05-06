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
     * @param {Object} element
     * @return {type.ERDEntity} entity
     */
    createErdEntity(element) {
        // return app.factory.createModel({
        //   id: "ERDEntity",
        //   parent: this._root,
        //   modelInitializer: elem => {
        //     elem.name = name;
        //   }
        // });
        const elem = new type.ERDEntity();

        elem._parent = this._root;
        elem.name = element.table_name;
        elem.documentation = element.table_description;

        this._root.ownedElements.push(elem);

        return elem;
    }


    /**
     * Create a column
     *
     * @param {type.ERDEntity} namespace
     * @param {Object} element
     * @param {Function} handleRefNotFound
     * @return {type.ERDColumn} column
     */
    createErdColumn(namespace, element, handleRefNotFound) {
        // return app.factory.createModel({
        //   id: "ERDColumn",
        //   parent: namespace,
        //   field: "columns",
        //   modelInitializer: elem => {
        //     elem.name = element.column_name;
        //     elem.primaryKey = Boolean(element.is_primary_key);
        //     elem.nullable = Boolean(element.is_nullable);
        //     elem.unique = !elem.primaryKey && Boolean(element.is_unique);
        //     elem.type = element.data_type.toUpperCase();
        //     elem.length = element.max_length ? element.max_length.toString() : "";
        //     elem.foreignKey = Boolean(element.is_foreign_key);
        //     elem.referenceTo = elem.foreignKey
        //         ? this.createReference(elem,
        //             element.foreign_key_name,
        //             element.referenced_table_name,
        //             element.referenced_column_name,
        //             handleRefNotFound)
        //         : undefined;
        //   }
        // });
        const elem = new type.ERDColumn();

        elem._parent = namespace;
        elem.name = element.column_name;
        elem.documentation = element.column_description;
        elem.primaryKey = Boolean(element.is_primary_key);
        elem.nullable = Boolean(element.is_nullable);
        elem.unique = !elem.primaryKey && Boolean(element.is_unique);
        elem.type = element.data_type.toUpperCase();
        elem.length = element.max_length ? element.max_length.toString() : "";
        elem.foreignKey = Boolean(element.is_foreign_key);
        elem.referenceTo = elem.foreignKey
            ? this.createReference(elem,
                element.foreign_key_name,
                element.referenced_table_name,
                element.referenced_column_name,
                handleRefNotFound)
            : undefined;

        namespace.columns.push(elem);

        return elem;
    }


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
    }


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
    }


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
        // return app.factory.createModelAndView({
        //   id: "ERDRelationship",
        //   parent: namespace,
        //   tailModel: elementFrom._parent,
        //   headModel: elementTo._parent,
        //   modelInitializer: elem => {
        //     elem.name = name;
        //     elem.identifying = true;
        //     elem.end1 = this.createErdRelationshipEnd(elem, elementFrom, "",
        //         elementFrom.unique ? "0..1" : "0..*");
        //     elem.end2 = this.createErdRelationshipEnd(elem, elementTo, elementFrom.name,
        //         elementFrom.nullable ? "0..1" : "1");
        //   }
        // });
        const elem = new type.ERDRelationship();

        elem._parent = namespace;
        elem.name = name;
        elem.identifying = true;
        elem.end1 = this.createErdRelationshipEnd(elem, elementFrom, "",
            elementFrom.unique ? "0..1" : "0..*");
        elem.end2 = this.createErdRelationshipEnd(elem, elementTo, elementFrom.name,
            elementFrom.nullable ? "0..1" : "1");

        namespace.ownedElements.push(elem);

        return elem;
    }


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
        // return app.factory.createModel({
        //   id: "ERDRelationshipEnd",
        //   parent: namespace,
        //   modelInitializer: elem => {
        //     elem.name = name;
        //     elem.identifying = true;
        //     elem.cardinality = cardinality;
        //     elem.reference = element._parent;
        //   }
        // });
        const elem = new type.ERDRelationshipEnd();

        elem._parent = namespace;
        elem.name = name;
        elem.identifying = true;
        elem.cardinality = cardinality;
        elem.reference = element._parent;

        return elem;
    };
}

module.exports = ErDmBuilder;
