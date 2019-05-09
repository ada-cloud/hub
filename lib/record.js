class Record {
    constructor({ topic, id, path, data, state, info, method, timmer }) {
        this._id = id;
        this._topic = topic;
        this._path = path;
        this._data = data;
        this._state = state;
        this._info = info;
        this._method = method;
        this._timmer = timmer;
        this._time = new Date().getTime();
    }

    get id() {
        return this._id;
    }

    get topic() {
        return this._topic;
    }

    get path() {
        return this._path;
    }

    get data() {
        return this._data;
    }

    get state() {
        return this._state;
    }

    get info() {
        return this._info;
    }

    get method() {
        return this._method;
    }

    get time() {
        return this._time;
    }

    get timmer() {
        return this._timmer;
    }

    getRecord() {
        let r = {};
        ['id', 'topic', 'path', 'data', 'state', 'info', 'method', 'time'].forEach(a => r[a] = this[a]);
        if (this.timmer) {
            r.timmer = this.timmer;
        }
        return r;
    }
}

module.exports = {
    Record,
    getInstance(obj) {
        let { topic, id, path, data, state, info, method, timmer } = obj;
        return new Record({ topic, id, path, data, state, info, method, timmer });
    }
};