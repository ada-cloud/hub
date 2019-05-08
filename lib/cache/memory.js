const Cache = require("./index");

class MemoryCache extends Cache {
    constructor(option) {
        super(option);
        this._cache = [];
    }

    set(clientId, info) {
        let t = this.get(clientId);
        if (t) {
            Object.assign(t, info || {});
        } else {
            this._cache.push({ id: clientId, data: info });
        }
    }

    setPort(clientId, info) {
        let client = this.get(clientId);
        if (client) {
            client.cache.push(info);
        }
    }

    getPort(clientId) {
        let client = this.get(clientId);
        if (client) {
            return client.cache.shift();
        }
        return null;
    }

    get(clientId) {
        let t = this._cache.find(a => a.id === clientId);
        if (t) {
            return t.data;
        } else {
            return null;
        }
    }

    remove(clientId) {
        let index = this._cache.findIndex(a => a.id === clientId);
        if (index !== -1) {
            this._cache.splice(index, 1);
            this.emit('clientremove');
        }
    }

    getAll() {
        return this._cache.map(a => a.data);
    }
}

module.exports = MemoryCache;