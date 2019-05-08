class Message {
    constructor({ id, type, method, data, topic, state }) {
        this._id = id;
        this._type = type;
        this._data = data;
        this._method = method;
        this._topic = topic;
        this._state = state;
    }

    get id() {
        return this._id;
    }

    get method() {
        return this._method;
    }

    get type() {
        return this._type;
    }

    get data() {
        return this._data;
    }

    get topic() {
        return this._topic;
    }

    get state() {
        return this._state;
    }

    getInfo() {
        let r = {};
        ['id', 'method', 'type', 'data', 'topic', 'state'].forEach(a => this[a] && (r[a] = this[a]));
        return r;
    }

    stringify() {
        return JSON.stringify(this.getInfo());
    }
}

module.exports = Message;