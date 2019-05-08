const Message = require("./base");
const { ProducerMessage, ResolveMessage, StateMessage, StateSetMessage, ClientBroadcastMessage } = require("./types/client");
const { ConsumerMessage, InquireMessage, NeedloginMessage,LoginedMessage, FailMessage, SuccessMessage, TimeoutMessage, ErrorMessage, BroadcastMessage } = require("./types/server");
const { CLIENTSENDMESSAGETYPES, SERVERSENDMESSAGETYPES, SERVERPOSTTYPES } = require("../const");

const TYPES = {
    [CLIENTSENDMESSAGETYPES.RESOLVE]: { t: ResolveMessage, p: ['id'] },
    [CLIENTSENDMESSAGETYPES.PRODUCER]: { t: ProducerMessage, p: ['topic', 'method', 'data'] },
    [CLIENTSENDMESSAGETYPES.PRODUCERSTATE]: { t: StateMessage, p: ['topic', 'data'] },
    [CLIENTSENDMESSAGETYPES.PRODUCERSETSTATE]: { t: StateSetMessage, p: ['id', 'topic', 'state'] },
    [CLIENTSENDMESSAGETYPES.BROADCAST]: { t: ClientBroadcastMessage, p: ['topic', 'data'] },
    [SERVERSENDMESSAGETYPES.BROADCAST]: { t: BroadcastMessage, p: ['topic', 'data'] },
    [SERVERSENDMESSAGETYPES.CONSUMER]: { t: ConsumerMessage, p: ['id', 'topic', 'method', 'data'] },
    [SERVERSENDMESSAGETYPES.INQUIRE]: { t: InquireMessage, p: ['id', 'topic', 'method', 'data', 'state'] },
    [SERVERSENDMESSAGETYPES.TIMEOUT]: { t: TimeoutMessage, p: [] },
    [SERVERPOSTTYPES.ERROR]: { t: ErrorMessage, p: ['data'] },
    [SERVERPOSTTYPES.SUCCESS]: { t: SuccessMessage, p: ['id'] },
    [SERVERPOSTTYPES.FAIL]: { t: FailMessage, p: ['data'] },
    [SERVERPOSTTYPES.NEEDLOGIN]: { t: NeedloginMessage, p: [] },
    [SERVERPOSTTYPES.LOGINED]: { t: LoginedMessage, p: [] }
};

const Helper = {
    Message,
    client: {
        ProducerMessage,
        ResolveMessage,
        StateSetMessage,
        StateMessage,
        ClientBroadcastMessage
    },
    server: {
        ConsumerMessage,
        InquireMessage,
        TimeoutMessage
    },
    served: {
        SuccessMessage,
        ErrorMessage,
        FailMessage,
        NeedloginMessage,
        BroadcastMessage,
        LoginedMessage
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