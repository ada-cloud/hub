class BaseBroker {
    constructor(store) {
        this._store = store;
    }

    get type() {
        return '';
    }

    get store() {
        return this._store;
    }

    put(message, clientInfo) { }

    remove(id) {
        return Promise.resolve().then(() => this.store.remove(id));
    }

    get(topic) {
        return Promise.resolve(null);
    }

    getState() {
        return this._store.getState(this.type);
    }
}

module.exports = BaseBroker;