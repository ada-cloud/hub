const { PRODUCERMETHODTYPES, CLIENTSENDMESSAGETYPES, STOREGETRESULT } = require("./../const");
const NormalBroker = require("./types/normal");
const SortBroker = require("./types/sort");
const StateBroker = require("./types/state");
const { server } = require("./../message");
const { get } = require("./../register");
class BrokerManager {
    constructor() {
        let { storeType, storeOption } = get('config').broker;
        let store = new storeType(storeOption);
        this._broker = {
            [PRODUCERMETHODTYPES.NORMAL]: new NormalBroker(store),
            [PRODUCERMETHODTYPES.SORT]: new SortBroker(store),
            [PRODUCERMETHODTYPES.STATE]: new StateBroker(store)
        };
    }

    put(message, clientInfo) {
        return new Promise((resolve, reject) => {
            let { id, type, method } = message;
            if (type === CLIENTSENDMESSAGETYPES.PRODUCER && method !== PRODUCERMETHODTYPES.STATE) {
                let broker = this._broker[method];
                if (broker) {
                    broker.put(message, clientInfo).then(id => resolve(id), () => reject());
                } else {
                    reject();
                }
            } else if (type === CLIENTSENDMESSAGETYPES.PRODUCERSTATE) {
                this._broker[PRODUCERMETHODTYPES.STATE].put(message, clientInfo).then(id => resolve(id), () => reject());
            } else if (type === CLIENTSENDMESSAGETYPES.PRODUCERSETSTATE) {
                this._broker[PRODUCERMETHODTYPES.STATE].set(message).then(id => resolve(id), () => reject());
            } else if (type === CLIENTSENDMESSAGETYPES.RESOLVE) {
                let [topic, method] = id.split("/"), broker = this._broker[method];
                if (broker) {
                    broker.remove(id).then(() => resolve(), () => reject());
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

    take(topic) {
        let targets = [PRODUCERMETHODTYPES.STATE, PRODUCERMETHODTYPES.SORT, PRODUCERMETHODTYPES.NORMAL];
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