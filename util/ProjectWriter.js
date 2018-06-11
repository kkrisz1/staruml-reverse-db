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
    var builder = app.repository.getOperationBuilder();
    builder.insert(this.model);
    builder.fieldInsert(this.model._parent, "ownedElements", this.model);
  };


  generateEmptyDiagram(name) {
    var baseModel = app.repository.get(this.model._id);

    app.factory.createDiagram(name, baseModel);
  };
}

module.exports = ProjectWriter;
