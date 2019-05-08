const Cache = require("./index");

class RedisCache extends Cache {
    constructor(option) {
        super(option);
    }

    set(clientId, info) {
    }

    setPort(clientId, info) {
    }

    getPort(clientId) {
    }

    get(clientId) {
    }

    remove(clientId) {
    }

    getAll() {
    }
}

module.exports = RedisCache;