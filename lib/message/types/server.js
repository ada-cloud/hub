const Message = require("./../base");
const { SERVERPOSTTYPES, SERVERSENDMESSAGETYPES } = require("../../const");
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
class SuccessMessage extends Message {
    constructor(id) {
        super({ id, type: SERVERPOSTTYPES.SUCCESS });
    }
}
class TimeoutMessage extends Message {
    constructor() {
        super({ type: SERVERSENDMESSAGETYPES.TIMEOUT });
    }
}
class ErrorMessage extends Message {
    constructor(data) {
        super({ data, type: SERVERPOSTTYPES.ERROR });
    }
}
class FailMessage extends Message {
    constructor(data) {
        super({ data, type: SERVERPOSTTYPES.FAIL });
    }
}
class NeedloginMessage extends Message {
    constructor() {
        super({ type: SERVERPOSTTYPES.NEEDLOGIN });
    }
}

class LoginedMessage extends Message {
    constructor() {
        super({ type: SERVERPOSTTYPES.LOGINED });
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
    SuccessMessage,
    TimeoutMessage,
    ErrorMessage,
    FailMessage,
    NeedloginMessage,
    BroadcastMessage,
    LoginedMessage
};