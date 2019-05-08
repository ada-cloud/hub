const Port = require("./port");
const { client } = require("../../lib/message");
const { PRODUCERMETHODTYPES, SERVERSENDMESSAGETYPES } = require("../../lib/const");
const api = require("./api");
const StatePoster = require("./poster");
const Fuse = require("cloud-util/fuse");
const Emitter = require("events");

class Client extends Emitter {
    constructor() {
        super();
        this._retryMap = new Map();
        this._observer = {};
        this._watcher = {};
        this.connect();
    }

    get port() {
        return this._port;
    }

    get isDisconnect() {
        return this.port.isDisconnect;
    }

    connect() {
        this._port = new Port();
        this._port.on('disconnect', () => this.emit('disconnect'));
        this._port.on('reconnect', () => this.emit('reconnect'));
        this._port.on('connected', () => this.emit('connected'));
        this._port.on('message', ({ topic, message }) => {
            this._trigger(topic, message);
            this.emit('message');
        });
    }

    update() {
        this._port.stop();
        this.connect();
        this.emit('updated');
    }

    observe(topicName, fn) {
        if (!this._observer[topicName]) {
            this._observer[topicName] = [];
            this._port.setTopic(topicName);
        }
        this._observer[topicName].push(fn);
        return this;
    }

    unobserve(topicName, fn) {
        let target = this._observer[topicName];
        if (target) {
            let index = target.indexOf(fn);
            if (index !== -1) {
                target.splice(index, 1);
            }
        }
    }

    watch(topicName, fn) {
        if (!this._watcher[topicName]) {
            this._watcher[topicName] = [];
        }
        this._watcher[topicName].push(fn);
        return this;
    }

    unwatch(topicName, fn) {
        let target = this._watcher[topicName];
        if (target) {
            let index = target.indexOf(fn);
            if (index !== -1) {
                target.splice(index, 1);
            }
        }
    }

    _trigger(topic, message) {
        let { type } = message;
        let obs = (type === SERVERSENDMESSAGETYPES.BROADCAST ? this._watcher[topic] : this._observer[topic]);
        if (obs) {
            obs.reduce((a, ob) => {
                return a.then(() => {
                    return Promise.resolve().then(() => ob(message));
                });
            }, Promise.resolve()).then(() => {
                return new Fuse(() => api.put(new client.ResolveMessage(message.id))).excute();
            });
        }
    }

    post({ topic, method, info }) {
        if (!this.port.isDisconnect) {
            return api.put(new client.ProducerMessage(topic, method, info)).then(data => data.id);
        } else {
            return Promise.reject('client disconnect');
        }
    }

    postMessage(topic, info) {
        if (!this.port.isDisconnect) {
            return this.post({ topic, method: PRODUCERMETHODTYPES.NORMAL, info });
        } else {
            return Promise.reject('client disconnect');
        }
    }

    postStateMessage(topic, info) {
        if (!this.port.isDisconnect) {
            return api.put(new client.StateMessage(topic, info)).then(data => {
                return new StatePoster(data.id, topic);
            });
        } else {
            return Promise.reject('client disconnect');
        }
    }

    postSortMessage(topic, info) {
        return this.post({ topic, method: PRODUCERMETHODTYPES.SORT, info });
    }

    postBroadcastMessage(topic, info) {
        if (!this.port.isDisconnect) {
            return api.put(new client.ClientBroadcastMessage(topic, info)).then(data => data.id);
        } else {
            return Promise.reject('client disconnect');
        }
    }

    quit() {
        if (!this.port.isDisconnect) {
            this.port.stop();
            return api.quit();
        } else {
            return Promise.reject('client disconnect');
        }
    }
}

module.exports = Client;