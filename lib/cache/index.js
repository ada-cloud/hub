const { get } = require("./../register");
const Emitter = require("events");
class Cache extends Emitter {
    constructor(option) {
        super();
        this._option = option;
    }

    get option() {
        return this._option;
    }

    set(clientId, info) { }

    setPort(clientId, info) { }

    getPort(clientId) { }

    get(clientId) { }

    remove(clientId) { }

    getAll() {
        return [];
    }

    _run() {
        let { maxTime, interval } = get('config').cache;
        Promise.resolve().then(() => this.getAll()).then(clients => {
            let removes = clients.filter(client => (new Date().getTime() - client.time > maxTime));
            if (removes.length > 0) {
                removes.reduce((a, client) => {
                    return a.then(() => this.remove(client.id));
                }, Promise.resolve()).then(() => {
                    this.emit('clientremove');
                });
            }
        }).then(() => {
            setTimeout(() => this._run(), interval);
        }).catch(() => {
            setTimeout(() => this._run(), interval);
        });
    }
}

module.exports = Cache;