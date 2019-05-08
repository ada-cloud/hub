const api = require("./api");
const { client } = require("../../lib/message");
const { MESSAGESTATE } = require("../../lib/const");

class StatePoster {
    constructor(id, topic) {
        this._messageId = id;
        this._topic = topic;
    }

    get messageId() {
        return this._messageId;
    }

    get topic() {
        return this._topic;
    }

    setState(state) {
        return api.put(new client.StateSetMessage(this.messageId, this.topic, state)).then(data => {
            return new StatePoster(data.id, this.topic);
        });
    }

    complete() {
        return new Promise((resolve, reject) => {
            api.put(new client.StateSetMessage(this.messageId, this.topic, MESSAGESTATE.READY)).then(() => resolve(), () => reject());
        });
    }
}

module.exports = StatePoster;