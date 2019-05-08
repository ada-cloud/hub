const BaseBroker = require("./../base");
const Record = require("./../../record");
const { MESSAGESTATE, PRODUCERMETHODTYPES } = require("./../../const");
const { uuid } = require('./../../helper');
class NormalBroker extends BaseBroker {
    get type() {
        return PRODUCERMETHODTYPES.NORMAL;
    }

    put(message, clientInfo) {
        let { topic, method, data, type } = message;
        let id = uuid(), path = `${topic}/${method}/${id}`;
        let record = Record.getInstance({ id, topic, method, data, type, path, info: clientInfo, state: MESSAGESTATE.READY });
        return Promise.resolve().then(() => this.store.add(record)).then(() => path);
    }

    get(topic) {
        return Promise.resolve().then(() => this.store.get(topic));
    }
}

module.exports = NormalBroker;