const Message = require("./../base");
const { CLIENTSENDMESSAGETYPES, PRODUCERMETHODTYPES } = require("../../const");

class ProducerMessage extends Message {
    constructor(topic, method, data) {
        super({ topic, data, method, type: CLIENTSENDMESSAGETYPES.PRODUCER });
    }
}

class StateMessage extends Message {
    constructor(topic, data) {
        super({ topic, data, type: CLIENTSENDMESSAGETYPES.PRODUCERSTATE, method: PRODUCERMETHODTYPES.STATE });
    }
}

class StateSetMessage extends Message {
    constructor(id, topic, state) {
        super({ id, topic, state, type: CLIENTSENDMESSAGETYPES.PRODUCERSETSTATE, method: PRODUCERMETHODTYPES.STATE });
    }
}

class ResolveMessage extends Message {
    constructor(id) {
        super({ id, type: CLIENTSENDMESSAGETYPES.RESOLVE });
    }
}

class ClientBroadcastMessage extends Message {
    constructor(topic, data) {
        super({ id: '', topic, data, type: CLIENTSENDMESSAGETYPES.BROADCAST, method: PRODUCERMETHODTYPES.BROADCAST });
    }
}

module.exports = {
    ProducerMessage,
    ResolveMessage,
    StateSetMessage,
    StateMessage,
    ClientBroadcastMessage
};