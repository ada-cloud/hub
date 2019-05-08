require("colors");
const { parse } = require("../../lib/message");
const { SERVERSENDMESSAGETYPES, debug } = require("../../lib/const");
const api = require("./api");
const Emitter = require("events");

class Port extends Emitter {
    constructor() {
        super();
        this._topic = [];
        this._stop = false;
        this._retry = 0;
        this._disconnect = false;
        this._connected = false;
        this._start();
    }

    get topic() {
        return this._topic;
    }

    get isDisconnect() {
        return this._disconnect;
    }

    get isConnected() {
        return this._connected;
    }

    setTopic(topic) {
        if (this.topic.indexOf(topic) === -1) {
            this.topic.push(topic);
        }
    }

    stop() {
        this._disconnect = true;
        this._stop = true;
    }

    _start() {
        if (!this._stop) {
            api.get(this.topic).then(data => {
                if (!this._connected) {
                    this._connected = true;
                    this.emit('connected');
                }
                if (this._retry !== 0) {
                    this._retry = 0;
                    this._disconnect = false;
                    this.emit('reconnect');
                }
                if (!Array.isArray(data)) {
                    data = [data];
                }
                data.forEach(message => {
                    let { type, topic } = message;
                    if (type === SERVERSENDMESSAGETYPES.CONSUMER || type === SERVERSENDMESSAGETYPES.BROADCAST || type === SERVERSENDMESSAGETYPES.INQUIRE) {
                        this.emit('message', { topic, message: parse(message) });
                    }
                });
                this._start();
            }).catch(e => {
                debug(e);
                this._disconnect = true;
                this._connected = false;
                if (this._retry < 60) {
                    this._retry++;
                    debug(`cloud-hub service error,retry [${this._retry}]`);
                    setTimeout(() => this._start(), 2000);
                } else {
                    debug(`cloud-hub service error,retry done,cloud-hub client lose connection`);
                    this.emit('disconnect');
                }
            });
        }
    }
}

module.exports = Port;