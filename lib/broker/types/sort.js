const BaseBroker = require("./../base");
const Record = require("./../../record");
const { MESSAGESTATE, PRODUCERMETHODTYPES } = require("./../../const");
const { uuid } = require("./../../helper");
class SortBroker extends BaseBroker {
    get type() {
        return PRODUCERMETHODTYPES.SORT;
    }

    put(message, clientInfo) {
        let { topic, method, data, type } = message;
        let id = uuid(), path = `${topic}/${method}/${id}`;
        let record = Record.getInstance({ id, topic, method, data, type, path, info: clientInfo, state: MESSAGESTATE.READY });
        return Promise.resolve().then(() => this.store.push(record));
    }

    get(topic) {
        return Promise.resolve().then(() => this.store.shift(topic));
    }
}

module.exports = SortBroker;