class DbRequestInput {

    /**
     * DbRequestInput
     *
     * @constructor
     * @param {string} name
     * @param {string} type
     * @param {string} value
     */
    constructor(name, type, value) {
        /**
         * @private
         * @member {string}
         */
        this.name = name;

        /**
         * @private
         * @member {string}
         */
        this.type = type;

        /**
         * @private
         * @member {string}
         */
        this.value = value;
    }
}

module.exports = DbRequestInput;
