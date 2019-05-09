const BaseBroker = require("../base");
const Record = require("../../record");
const { MESSAGESTATE, PRODUCERMETHODTYPES } = require("../../const");
const { uuid } = require("../../helper");
const { TimmerMessageError } = require("./../../error/server");

class TimmerBroker extends BaseBroker {
    get type() {
        return PRODUCERMETHODTYPES.TIMMER;
    }

    put(message, clientInfo) {
        let { topic, method, data, type } = message;
        if (data.timmer > new Date().getTime()) {
            let id = uuid(), path = `${topic}/${method}/${id}`;
            let record = Record.getInstance({ id, topic, method, data: data.data, timmer: data.timmer, type, path, info: clientInfo, state: MESSAGESTATE.TIMMER });
            return Promise.resolve().then(() => this.store.add(record)).then(() => path);
        } else {
            return Promise.reject(new TimmerMessageError());
        }
    }

    get(topic) {
        return Promise.resolve().then(() => this.store.timeup(topic));
    }
}

module.exports = TimmerBroker;