const BaseError = require("ada-cloud-util/error");

class UnknowMessageId extends BaseError {
    constructor() {
        super("unknow message id");
    }
}

class UnknowMessageMethod extends BaseError {
    constructor(method) {
        super(`unknow message method [${method}]`);
    }
}

class UnknowMessageTopic extends BaseError {
    constructor() {
        super('unknow message topic');
    }
}

class UnsupportMessageType extends BaseError {
    constructor(type) {
        super(`unsupport message type of [${type}]`);
    }
}

class TimmerMessageError extends BaseError{
    constructor(){
        super('timmer is less then servier time');
    }
}

module.exports = {
    UnknowMessageId,
    UnknowMessageMethod,
    UnknowMessageTopic,
    UnsupportMessageType,
    TimmerMessageError
};