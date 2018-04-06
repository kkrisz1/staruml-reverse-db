/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50, regexp: true */
/*global define, $, _, window, app */
define(function (require, exports, module) {
  "use strict";

  var AppInit = app.getModule("utils/AppInit");
  var PreferenceManager = app.getModule("core/PreferenceManager");

  /**
   * DbPreferences
   * @constructor
   * @param {string} registeredName
   * @param {string} preferenceId
   */
  function DbPreferences(registeredName, preferenceId) {
    /**
     * @private
     * @member {string}
     */
    this.registeredName = registeredName;

    /**
     * @private
     * @member {string}
     */
    this.preferenceId = preferenceId;

    this.connPrefKeyPrefix = this.preferenceId + ".connection";
    this.connPrefOptKeyPrefix = this.connPrefKeyPrefix + ".options";

    /**
     * @private
     * @member {object}
     */
    this.dbPreferences = this._initDbPrefs();
  }

  /**
   * Register DbPreferences
   * @return {object}
   */
  DbPreferences.prototype._register = function () {
    var self = this;

    AppInit.htmlReady(function () {
      PreferenceManager.register(self.preferenceId, self.registeredName, self.dbPreferences);
    });
  };

  /**
   * Initialize Common DB DbPreferences
   * @return {object}
   */
  DbPreferences.prototype._initDbPrefs = function () {
    var self = this;
    var dbPreferences = {};

    dbPreferences[self.connPrefKeyPrefix] = {
      text: "Database Connection",
      type: "Section"
    };
    dbPreferences[self.connPrefKeyPrefix + ".username"] = {
      text: "Username",
      description: "Username for database connection.",
      type: "String",
      default: ""
    };
    dbPreferences[self.connPrefKeyPrefix + ".password"] = {
      text: "Password",
      description: "Password for database connection.",
      type: "String",
      default: ""
    };
    dbPreferences[self.connPrefKeyPrefix + ".server"] = {
      text: "Server IP",
      description: "IP address of the database server.",
      type: "String",
      default: "localhost"
    };
    dbPreferences[self.connPrefKeyPrefix + ".owner"] = {
      text: "Table Schema (Database Schema)",
      description: "Table Schema (Database Schema)",
      type: "String",
      // default: "" // TODO database dependent
    };
    dbPreferences[self.connPrefOptKeyPrefix] = {
      text: "Database Connection Options",
      type: "Section"
    };
    dbPreferences[self.connPrefOptKeyPrefix + ".port"] = {
      text: "Server Port",
      description: "Port number to access the database server.",
      type: "Number",
      // default: -1 // TODO database dependent
    };
    dbPreferences[self.connPrefOptKeyPrefix + ".database"] = {
      text: "Table Catalog (Database)",
      description: "Table Catalog (Database)",
      type: "String",
      default: ""
    };

    return dbPreferences;
  };

  /**
   * Preference ID
   * @return {object}
   */
  DbPreferences.prototype.getId = function () {
    var self = this;

    return self.preferenceId;
  };

  /**
   * Connection options
   * @return {object}
   */
  DbPreferences.prototype.getConnOptions = function () {
    var self = this;

    return {
      userName: PreferenceManager.get(self.connPrefKeyPrefix + ".username"),
      password: PreferenceManager.get(self.connPrefKeyPrefix + ".password"),
      server: PreferenceManager.get(self.connPrefKeyPrefix + ".server"),
      owner: PreferenceManager.get(self.connPrefKeyPrefix + ".owner"),
      options: {
        port: PreferenceManager.get(self.connPrefOptKeyPrefix + ".port"),
        database: PreferenceManager.get(self.connPrefOptKeyPrefix + ".database")
      }
    };
  };

  module.exports = DbPreferences;
});
