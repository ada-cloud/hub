const BaseBroker = require("./../base");
const { MESSAGESTATE, PRODUCERMETHODTYPES } = require("./../../const");
const { uuid } = require("./../../helper");
const Record = require("./../../record");
class StateBroker extends BaseBroker {
    get type() {
        return PRODUCERMETHODTYPES.STATE;
    }

    put(message, clientInfo) {
        let { topic, method, data, type } = message;
        let id = uuid(), path = `${topic}/${method}/${id}`;
        let record = Record.getInstance({ id, topic, method, data, type, path, info: clientInfo, state: MESSAGESTATE.PREPARE });
        return Promise.resolve().then(() => this.store.add(record)).then(() => path);
    }

    set(message) {
        let { topic, state, id } = message;
        if (id) {
            return Promise.resolve().then(() => this.store.set({ id, topic, state })).then(() => id);
        }
    }

    get(topic) {
        return Promise.resolve().then(() => this.store.state(topic));
    }
}

module.exports = StateBroker;