require("colors");
const Register = require("./../register");
const Client = require("./client");
const { CACHEID, SERVERCREATETOPIC, debug } = require("./../const");

class ClientManager {
    constructor() {
        let { cacheType, cacheOption } = Register.get('config').cache;
        this._times = 0;
        this._clients = new Map();
        this._cache = new cacheType(cacheOption);
        this._cache.on('clientremove', () => {
            this.getAllCachedClients().then(clients => {
                let removes = [];
                this._clients.forEach(client => {
                    let b = clients.find(a => a.id === client.id);
                    if (!b) {
                        removes.push(client.id);
                    }
                });
                removes.forEach(a => {
                    let { name, protocol, host, port } = this._clients.get(a);
                    debug(`OFFLINE => [${name}] ${protocol} | ${host} | ${port}`);
                    this._clients.delete(a);
                });
                this._broadcastChangeMessage();
            });
        });
        this._cache._run();
    }

    get clients() {
        return this._clients;
    }

    get cache() {
        return this._cache;
    }

    getAllCachedClients() {
        return Promise.resolve().then(() => this.cache.getAll()).then(clients => {
            let { timeout } = Register.get('config').manager;
            return clients.filter(client => (new Date().getTime() - client.time < timeout)).map(({ topic, name, protocol, host, port, cache }) => {
                return new Client({ topic, name, protocol, host, port, cache, cacheProvider: this.cache });
            });
        });
    }

    getAllCachedClientInfo() {
        return Promise.resolve().then(() => this.cache.getAll());
    }

    init() {
        return this.getAllCachedClients().then(clients => {
            clients.forEach(client => {
                this.clients.set(client.id, client);
            });
            this._run();
        });
    }

    hasClient({ protocol, host, name, port }) {
        let id = CACHEID({ protocol, host, port, name });
        return this.clients.has(id);
    }

    setClient({ topic, protocol, host, name, port, response }) {
        debug(`BEAT => [${name}] ${protocol} | ${host} | ${port}`);
        let id = CACHEID({ protocol, host, port, name }), client = this.clients.get(id);
        if (client) {
            if (!client.isAlive) {
                client = this.clients.get(id);
                client.topic = topic;
                client.setResponse(response);
            }
        } else {
            debug(`ONLINE => [${name}] ${protocol} | ${host} | ${port}`);
            client = new Client({ topic, protocol, host, port, name, cache: [], cacheProvider: this.cache });
            this.clients.set(id, client);
            client.setResponse(response).then(() => {
                this._broadcastChangeMessage();
            });
        }
    }

    quitClient({ name, protocol, host, port }) {
        let id = CACHEID({ protocol, host, port, name }), client = this.clients.get(id);
        if (client) {
            return client.quit();
        } else {
            return Promise.resolve();
        }
    }

    broadcast(message) {
        return this.getAllCachedClients().then(clients => {
            return clients.reduce((a, client) => {
                return a.then(() => client.setPortInfo(message));
            }, Promise.resolve());
        });
    }

    _broadcastChangeMessage() {
        return Promise.resolve().then(() => this.cache.getAll()).then(clients => {
            return this.broadcast({
                topic: SERVERCREATETOPIC.SERVICECHANGE,
                data: clients
            });
        });
    }

    _balanceClients() {
        this._times++;
        if (this._times > 4) {
            this._times = 0;
        }
        let clients = [...this.clients.values()];
        if (this._times % 2 === 0) {
            clients = clients.sort((a, b) => a.createTime - b.createTime);
        } else {
            clients = clients.sort((a, b) => b.createTime - a.createTime);
        }
        return clients;
    }

    _run() {
        let { interval, timeout } = Register.get('config').manager;
        this._balanceClients().forEach(client => {
            if (!client.isRunning) {
                if (new Date().getTime() - client.time > timeout) {
                    if (client.isAlive) {
                        client.timeout();
                    }
                } else {
                    client.excute();
                }
            }
        });
        setTimeout(() => this._run(), interval);
    }
}

module.exports = ClientManager;