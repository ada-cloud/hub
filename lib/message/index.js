const Message = require("./base");
const {
    ProducerMessage,
    ResolveMessage,
    StateMessage,
    StateSetMessage,
    ClientBroadcastMessage,
    TimmerMessage
} = require("./types/client");
const {
    ConsumerMessage,
    InquireMessage,
    TimeoutMessage,
    BroadcastMessage
} = require("./types/server");
const { CLIENTSENDMESSAGETYPES, SERVERSENDMESSAGETYPES } = require("../const");

const TYPES = {
    [CLIENTSENDMESSAGETYPES.RESOLVE]: { t: ResolveMessage, p: ['id'] },
    [CLIENTSENDMESSAGETYPES.PRODUCER]: { t: ProducerMessage, p: ['topic', 'method', 'data'] },
    [CLIENTSENDMESSAGETYPES.PRODUCERSTATE]: { t: StateMessage, p: ['topic', 'data'] },
    [CLIENTSENDMESSAGETYPES.PRODUCERSETSTATE]: { t: StateSetMessage, p: ['id', 'topic', 'state'] },
    [CLIENTSENDMESSAGETYPES.BROADCAST]: { t: ClientBroadcastMessage, p: ['topic', 'data'] },
    [CLIENTSENDMESSAGETYPES.TIMMER]: { t: TimmerMessage, p: ['topic', 'data'] },
    [SERVERSENDMESSAGETYPES.BROADCAST]: { t: BroadcastMessage, p: ['topic', 'data'] },
    [SERVERSENDMESSAGETYPES.CONSUMER]: { t: ConsumerMessage, p: ['id', 'topic', 'method', 'data'] },
    [SERVERSENDMESSAGETYPES.INQUIRE]: { t: InquireMessage, p: ['id', 'topic', 'method', 'data', 'state'] },
    [SERVERSENDMESSAGETYPES.TIMEOUT]: { t: TimeoutMessage, p: [] }
};

const Helper = {
    Message,
    client: {
        ProducerMessage,
        ResolveMessage,
        StateSetMessage,
        StateMessage,
        ClientBroadcastMessage,
        TimmerMessage
    },
    server: {
        ConsumerMessage,
        InquireMessage,
        TimeoutMessage,
        BroadcastMessage
    },
    parse(str) {
        let info = (typeof str === 'object') ? str : JSON.parse(str);
        let { type } = info;
        if (TYPES[type]) {
            let { t, p } = TYPES[type], params = p.map(a => info[a]);
            return new t(...params);
        } else {
            return null;
        }
    },
    getMessageInstance(info) {
        let { type } = info;
        if (TYPES[type]) {
            let { t, p } = TYPES[type], params = p.map(a => info[a]);
            return new t(...params);
        } else {
            return null;
        }
    }
};

module.exports = Helper;