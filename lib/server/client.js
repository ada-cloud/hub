const { CACHEID } = require("../const");
const { get } = require("../register");
const { server } = require("../message");
const { writeResponse } = require("../helper");

class Client {
    constructor({ topic, protocol, host, name, port, cache, cacheProvider }) {
        this._topic = topic;
        this._protocol = protocol;
        this._host = host;
        this._name = name;
        this._port = port;
        this._cache = cache || [];

        this._cacheProvider = cacheProvider;
        this._response = null;
        this._time = new Date().getTime();
        this._createTime = new Date().getTime();
        this._isRunning = false;
        this._isDone = false;
    }

    get id() {
        return CACHEID({
            protocol: this.protocol,
            host: this.host,
            port: this.port,
            name: this.name
        });
    }

    get topic() {
        return this._topic;
    }

    set topic(topic) {
        this._topic = topic;
    }

    get protocol() {
        return this._protocol;
    }

    get host() {
        return this._host;
    }

    get name() {
        return this._name;
    }

    get port() {
        return this._port;
    }

    get cache() {
        return this._cache;
    }

    get cacheProvider() {
        return this._cacheProvider;
    }

    get baseInfo() {
        return {
            id: this.id,
            protocol: this.protocol,
            host: this.host,
            port: this.port,
            name: this.name,
            cache: this.cache
        };
    }

    get time() {
        return this._time;
    }

    get createTime() {
        return this._createTime;
    }

    get isRunning() {
        return this._isRunning;
    }

    get isDone() {
        return this._isDone;
    }

    get isAlive() {
        return this._response !== null;
    }

    setResponse(response) {
        this._response = response;
        this._time = new Date().getTime();
        return this.setCache().then(() => this.excute());
    }

    setCache() {
        return Promise.resolve().then(() => this.cacheProvider.set(this.id, Object.assign(this.baseInfo, { time: new Date().getTime() })));
    }

    setPortInfo(info) {
        return Promise.resolve().then(() => this.cacheProvider.setPort(this.id, info));
    }

    quit() {
        return Promise.resolve().then(() => this.cacheProvider.remove(this.id));
    }

    getPortMessage() {
        return new Promise(resolve => {
            let retryTime = 0;
            let getData = () => {
                Promise.resolve().then(() => this.cacheProvider.getPort(this.id)).then(info => {
                    if (info) {
                        let { topic, data } = info;
                        resolve(new server.BroadcastMessage(topic, data));
                    } else {
                        resolve(null);
                    }
                }).catch(e => {
                    retryTime++;
                    if (retryTime > 5) {
                        retryTime = 0;
                        resolve(null);
                    } else {
                        getData();
                    }
                });
            };
            getData();
        });
    }

    getBrokerMessage(topic) {
        return new Promise(resolve => {
            let retryTime = 0;
            let getData = () => {
                Promise.resolve().then(() => get('broker').take(topic)).then(message => resolve(message)).catch(e => {
                    retryTime++;
                    if (retryTime > 5) {
                        resolve(null);
                    } else {
                        getData(topic);
                    }
                });
            };
            getData(topic);
        });
    }

    excute() {
        if (this._response) {
            this._isRunning = true;
            let ps = Promise.resolve(), result = [];
            return ps.then(() => {
                return this.getPortMessage().then(message => {
                    if (message) {
                        result.push(message);
                    }
                });
            }).then(() => {
                return this.topic.reduce((a, _topic) => {
                    return a.then(() => {
                        return this.getBrokerMessage(_topic).then(message => {
                            if (message) {
                                result.push(message);
                            }
                        });
                    });
                }, Promise.resolve());
            }).then(() => {
                if (result.length > 0) {
                    let r = result.map(a => a.getInfo());
                    writeResponse(this._response, 200, r);
                    this._response = null;
                    this._isRunning = false;
                } else {
                    this._isRunning = false;
                }
            });
        } else {
            this._isRunning = false;
        }
    }

    timeout() {
        if (this._response) {
            writeResponse(this._response, 200, new server.TimeoutMessage().getInfo());
            this._response = null;
        }
    }
}

module.exports = Client;