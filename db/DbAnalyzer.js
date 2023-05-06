const ProjectWriter = require("../util/ProjectWriter");

const ErDmBuilder = require("../erd/ErDmBuilder");

class DbAnalyzer {
    /**
     * Database Schema Analyzer
     *
     * @constructor
     */
    constructor(options, model, manager) {
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
         * @member {object}
         */
        this.manager = manager;

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


    executeSql(request) {
        return this.manager.executeSql(request).then(result => {
            const builder = app.repository.getOperationBuilder();
            builder.begin("Generate ER Data Model");

            result.rows.forEach(row => this.performFirstPhase(row));
            this.performSecondPhase();

            builder.end();
            app.repository.doOperation(builder.getOperation());
        });
    };


    /**
     * Perform first phase:
     *   - get entity if exists, otherwise create a new one
     *   - create a column of the got/created entity
     *   - create relationship if there is a reference to another entity
     *
     * @param {Object} element
     */
    performFirstPhase(element) {
        const self = this;

        const entityName = element.table_name;
        if (!self.currentEntity || self.currentEntity.name !== entityName) {
            self.currentEntity = self.erDmBuilder.createErdEntity(element);
            // self.erDmBuilder.addErdEntity(self.currentEntity);
        }

        const column = self.erDmBuilder.createErdColumn(self.currentEntity, element,
            function (column, foreignKeyName, refEntityName, refColumnName) {
                const notFoundRef = {
                    column: column,
                    foreignKeyName: foreignKeyName,
                    refEntityName: refEntityName,
                    refColumnName: refColumnName
                };
                self.pendingReferences.push(notFoundRef);
            });
        // self.erDmBuilder.addErdColumn(self.currentEntity, column);

        if (column.foreignKey && column.referenceTo) {
            self.addOrSetErdRelationship(self.currentEntity, column, column.referenceTo, element.foreign_key_name);
        }
    };


    /**
     * Perform the second phase
     *   - proceed pending references
     *   - generate ER Data Model
     *   - generate empty ER Diagram
     */
    performSecondPhase() {
        this.proceedPendingReferences();
        this.projectWriter.generateModel();
    };


    /**
     * Create or set (if it exists) a relationship
     *
     * @param {type.ERDEntity} namespace
     * @param {type.ERDColumn} elementFrom
     * @param {type.ERDColumn} elementTo
     * @param {string} name
     * @throws {Error} 'elementFrom' is not a foreign key or 'elementTo' is undefined
     */
    addOrSetErdRelationship(namespace, elementFrom, elementTo, name) {
        if (!elementFrom.foreignKey) {
            throw new Error("'elementFrom' is not a foreign key ");
        }
        if (!elementTo) {
            throw new Error("'elementTo' is undefined");
        }

        let relationship = namespace.findByName(name);

        if (!relationship) {
            this.erDmBuilder.createErdRelationship(namespace, elementFrom, elementTo, name);
        } else {
            relationship.end2.name += ", " + elementFrom.name;
        }
    };


    /**
     * Proceed pending references
     */
    proceedPendingReferences() {
        const self = this;

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
}

module.exports = DbAnalyzer;
