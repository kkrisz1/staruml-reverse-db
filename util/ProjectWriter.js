class ProjectWriter {
    /**
     * Project Writer
     *
     * @constructor
     * @param {type.Model} model
     */
    constructor(model) {
        this.model = model;
    }

    generateModel() {
        const builder = app.repository.getOperationBuilder();
        builder.insert(this.model);
        builder.fieldInsert(this.model._parent, "ownedElements", this.model);
    };


    generateEmptyDiagram(name) {
        const baseModel = app.repository.get(this.model._id);

        app.factory.createDiagram(name, baseModel);
    };
}

module.exports = ProjectWriter;
