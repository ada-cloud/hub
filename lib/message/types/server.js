const Message = require("./../base");
const { SERVERSENDMESSAGETYPES } = require("../../const");
class ConsumerMessage extends Message {
    constructor(id, topic, method, data) {
        super({ id, data, topic, method, type: SERVERSENDMESSAGETYPES.CONSUMER });
    }
}
class InquireMessage extends Message {
    constructor(id, topic, method, data, state) {
        super({ id, data, topic, method, state, type: SERVERSENDMESSAGETYPES.INQUIRE });
    }
}
class TimeoutMessage extends Message {
    constructor() {
        super({ type: SERVERSENDMESSAGETYPES.TIMEOUT });
    }
}
class BroadcastMessage extends Message {
    constructor(topic, data) {
        super({ topic, data, type: SERVERSENDMESSAGETYPES.BROADCAST });
    }
}

module.exports = {
    ConsumerMessage,
    InquireMessage,
    TimeoutMessage,
    BroadcastMessage
};