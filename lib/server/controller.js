const { get } = require("./../register");
const { writeResponse, parseRequest, parseRequestMessage } = require("./../helper");
const { CLIENTSENDMESSAGETYPES, debug } = require("./../const");
const { File } = require("ada-util");
const Result = require("ada-cloud-util/result");

const Controller = {
    post_login: {
        authority: false,
        action({ request, response, clientManager }) {
            return parseRequest(request).then(message => {
                let { username, password, name, port, host, protocol } = JSON.parse(message);
                let has = clientManager.hasClient({ protocol, name, port, host });
                if (!has) {
                    let result = get('verifier').getToken({ username, password }, { username, name, host, protocol, port });
                    if (result) {
                        writeResponse(response, 200, Result.getSuccessResult(result).getResponseData());
                    } else {
                        writeResponse(response, 200, Result.getErrorResult().getResponseData());
                    }
                } else {
                    writeResponse(response, 200, Result.getLoginedResult().getResponseData());
                }
            });
        }
    },
    post_get: {
        authority: true,
        action({ clientManager, request, response, clientInfo }) {
            return parseRequest(request).then(topic => {
                let { protocol, host, port, name } = clientInfo;
                clientManager.setClient({ topic: JSON.parse(topic), name, protocol, host, port, response });
            });
        }
    },
    post_quit: {
        authority: true,
        action({ clientManager, clientInfo, response }) {
            let { protocol, host, port, name } = clientInfo;
            return clientManager.quitClient({ name, protocol, host, port }).then(() => {
                writeResponse(response, 200, Result.getSuccessResult().getResponseData());
            });
        }
    },
    post_set: {
        authority: true,
        action({ clientManager, request, response, clientInfo }) {
            return parseRequestMessage(request).then(message => {
                let { type } = message;
                if (type === CLIENTSENDMESSAGETYPES.BROADCAST) {
                    return clientManager.broadcast(message).then(() => writeResponse(response, 200, Result.getSuccessResult().getResponseData()));
                } else {
                    return get('broker').put(message, clientInfo).then(id => {
                        writeResponse(response, 200, Result.getSuccessResult(id || '').getResponseData());
                    });
                }
            });
        }
    },
    get_publickey: {
        authority: false,
        action({ response }) {
            let { publicKey } = get('config').rsa;
            return new File(publicKey).read().then(content => {
                writeResponse(response, 200, Result.getSuccessResult(content).getResponseData());
            });
        }
    },
    get_service: {
        authority: true,
        action({ response, clientManager }) {
            return clientManager.getAllCachedClientInfo().then(data => {
                writeResponse(response, 200, Result.getSuccessResult(data).getResponseData());
            });
        }
    },
    get_baseinfo: {
        authority: true,
        action({ response, clientManager }) {
            let { publicKey } = get('config').rsa;
            return new File(publicKey).read().then(content => {
                return clientManager.getAllCachedClientInfo().then(data => {
                    writeResponse(response, 200, Result.getSuccessResult({ publicKey: content, service: data }).getResponseData());
                });
            });
        }
    }
};

module.exports = Controller;