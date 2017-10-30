/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true, continue:true */
/*global define, $, _, window, app, type, document */
define(function (require, exports, module) {
  "use strict";

  var Core = app.getModule("core/Core");
  var OperationBuilder = app.getModule("core/OperationBuilder");
  var Repository = app.getModule("core/Repository");
  var ProjectManager = app.getModule("engine/ProjectManager");
  var Factory = app.getModule("engine/Factory");


  /**
   * Project Writer
   * @constructor
   * @param {type.Model} model
   */
  function ProjectWriter(model) {
    this.model = model;
  }

  ProjectWriter.prototype.generateModel = function () {
    OperationBuilder.insert(this.model);
    OperationBuilder.fieldInsert(this.model._parent, "ownedElements", this.model);
  };


  ProjectWriter.prototype.generateEmptyDiagram = function (name) {
    var baseModel = Repository.get(this.model._id);

    Factory.createDiagram(name, baseModel);
  };

  module.exports = ProjectWriter;
});
