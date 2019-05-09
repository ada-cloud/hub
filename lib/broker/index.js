const { PRODUCERMETHODTYPES, CLIENTSENDMESSAGETYPES, STOREGETRESULT } = require("./../const");
const NormalBroker = require("./types/normal");
const SortBroker = require("./types/sort");
const StateBroker = require("./types/state");
const TimmerBroker = require("./types/timmer");
const { server } = require("./../message");
const { get } = require("./../register");
const { UnknowMessageId, UnsupportMessageType, UnknowMessageMethod } = require("./../error/server");
class BrokerManager {
    constructor() {
        let { storeType, storeOption } = get('config').broker;
        let store = new storeType(storeOption);
        this._broker = {
            [PRODUCERMETHODTYPES.NORMAL]: new NormalBroker(store),
            [PRODUCERMETHODTYPES.SORT]: new SortBroker(store),
            [PRODUCERMETHODTYPES.STATE]: new StateBroker(store),
            [PRODUCERMETHODTYPES.TIMMER]: new TimmerBroker(store)
        };
    }

    put(message, clientInfo) {
        return new Promise((resolve, reject) => {
            let { id, type, method } = message;
            if (type === CLIENTSENDMESSAGETYPES.PRODUCER && method !== PRODUCERMETHODTYPES.STATE) {
                let broker = this._broker[method];
                if (broker) {
                    broker.put(message, clientInfo).then(id => resolve(id), (e) => reject(e));
                } else {
                    reject(new UnknowMessageMethod(method));
                }
            } else if (type === CLIENTSENDMESSAGETYPES.PRODUCERSTATE) {
                this._broker[PRODUCERMETHODTYPES.STATE].put(message, clientInfo).then(id => resolve(id), (e) => reject(e));
            } else if (type === CLIENTSENDMESSAGETYPES.PRODUCERSETSTATE) {
                this._broker[PRODUCERMETHODTYPES.STATE].set(message).then(id => resolve(id), (e) => reject(e));
            } else if (type === CLIENTSENDMESSAGETYPES.RESOLVE) {
                if (id) {
                    let [topic, method] = id.split("/"), broker = this._broker[method];
                    if (broker) {
                        broker.remove(id).then(() => resolve(), (e) => reject(e));
                    } else {
                        reject(new UnknowMessageMethod(method));
                    }
                } else {
                    reject(new UnknowMessageId());
                }
            } else {
                reject(new UnsupportMessageType(type));
            }
        });
    }

    take(topic) {
        let targets = [PRODUCERMETHODTYPES.STATE, PRODUCERMETHODTYPES.SORT, PRODUCERMETHODTYPES.NORMAL, PRODUCERMETHODTYPES.TIMMER];
        let done = false;
        let get = () => {
            let broker = this._broker[targets.shift()];
            if (broker) {
                return broker.get(topic).then(info => {
                    let { result, type } = info, message = null;
                    if (type === STOREGETRESULT.DONE) {
                        let { path, data, topic, method } = result;
                        return new server.ConsumerMessage(path, topic, method, data);
                    } else if (type === STOREGETRESULT.INQUIRE) {
                        let { path, data, topic, method, state } = result;
                        return new server.InquireMessage(path, topic, method, data, state);
                    } else {
                        return get();
                    }
                });
            } else {
                return null;
            }
        }
        return get();
    }

    getState() {
    }
}

module.exports = BrokerManager;