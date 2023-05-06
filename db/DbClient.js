class DbClient {
    constructor(options, pool, poolConfig) {
        /**
         * @private
         * @type {object}
         */
        this._options = options;

        /**
         * @private
         * @type {object}
         */
        this._pool = pool;

        /**
         * @private
         * @type {object}
         */
        this._poolConfig = poolConfig;
    }

    get options() {
        return this._options;
    }

    get pool() {
        return this._pool;
    }

    set pool(pool) {
        this._pool = pool;
    }

    get poolConfig() {
        return this._poolConfig;
    }
}

module.exports = DbClient;
