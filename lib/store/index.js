class Store {
    constructor(option) {
        this._option = option;
    }

    get option() {
        return this._option;
    }

    add(message) { }

    remove(id) { }

    push(message) { }

    shift(topic) { }

    get(topic) { }

    getState() { }
}

module.exports = Store;