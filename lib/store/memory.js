const Store = require("./index");
const { MESSAGESTATE, PRODUCERMETHODTYPES, STOREGETRESULT } = require("./../const");
const { get } = require("./../register");
class MemoryStore extends Store {
    constructor() {
        super({});
        this._map = new Map();
    }
    add(record) {
        let { topic, method } = record;
        if (!this._map.has(topic)) {
            let map = new Map();
            map.set(method, []);
            this._map.set(topic, map);
        }
        this._map.get(topic).get(method).push(record.getRecord());
    }

    set({ id, topic, state }) {
        let map = this._map.get(topic);
        if (map) {
            let area = map.get(PRODUCERMETHODTYPES.STATE);
            if (area) {
                let t = area.find(a => a.path === id);
                if (t) {
                    t.state = state;
                }
            }
        }
    }

    remove(path) {
        let [topic, method, id] = path.split("/");
        let topicMap = this._map.get(topic);
        if (topicMap) {
            let typeMap = topicMap.get(method);
            if (typeMap) {
                topicMap.set(method, typeMap.filter(a => a.id !== id));
            }
        }
    }

    push(record) {
        let { topic, method } = record;
        if (!this._map.has(topic)) {
            let map = new Map();
            map.set(method, []);
            this._map.set(topic, map);
        }
        this._map.get(topic).get(method).push(record.getRecord());
    }

    shift(topic) {
        let map = this._map.get(topic);
        let result = null, type = STOREGETRESULT.NOTHING;
        if (map) {
            let target = map.get(PRODUCERMETHODTYPES.SORT);
            if (target) {
                let a = target[0], current = new Date().getTime();
                if (a && a.state === MESSAGESTATE.READY) {
                    a.state = MESSAGESTATE.CONSUME;
                    type = STOREGETRESULT.DONE;
                    result = a;
                } else if (a && ((current - time) > get('config').broker.maxTime)) {
                    result = a;
                    type = STOREGETRESULT.INQUIRE;
                }
            }
        }
        return { result, type };
    }

    state(topic) {
        let map = this._map.get(topic);
        let result = null, type = STOREGETRESULT.NOTHING;
        if (map) {
            let area = map.get(PRODUCERMETHODTYPES.STATE);
            if (area) {
                let current = new Date().getTime();
                result = area.find(record => {
                    let { time, state } = record;
                    if (state === MESSAGESTATE.READY) {
                        record.state = MESSAGESTATE.CONSUME;
                        type = STOREGETRESULT.DONE;
                        return true;
                    } else if (state === MESSAGESTATE.CONSUME) {
                        if ((current - time) > get('config').broker.maxTime) {
                            type = STOREGETRESULT.INQUIRE;
                            return true;
                        }
                    } else if (state === MESSAGESTATE.PREPARE) {
                        if ((current - time) > get('config').broker.maxTime) {
                            type = STOREGETRESULT.INQUIRE;
                            return true;
                        }
                    }
                });
            }
        }
        return { result, type };
    }

    get(topic) {
        let map = this._map.get(topic);
        let result = null, type = STOREGETRESULT.NOTHING;
        if (map) {
            let area = map.get(PRODUCERMETHODTYPES.NORMAL);
            if (area) {
                let current = new Date().getTime();
                result = area.find(record => {
                    let { time, state } = record;
                    if (state === MESSAGESTATE.READY) {
                        record.state = MESSAGESTATE.CONSUME;
                        type = STOREGETRESULT.DONE;
                        return true;
                    } else if (state === MESSAGESTATE.CONSUME) {
                        if ((current - time) > get('config').broker.maxTime) {
                            type = STOREGETRESULT.INQUIRE;
                            return true;
                        }
                    }
                });
            }
        }
        return { result, type };
    }

    timeup(topic) {
        let map = this._map.get(topic);
        let result = null, type = STOREGETRESULT.NOTHING;
        if (map) {
            let area = map.get(PRODUCERMETHODTYPES.TIMMER);
            if (area) {
                let current = new Date().getTime();
                result = area.find(record => {
                    let { timmer, state, time } = record;
                    if (state === MESSAGESTATE.TIMMER) {
                        if (current >= timmer) {
                            record.state = MESSAGESTATE.CONSUME;
                            type = STOREGETRESULT.DONE;
                            return true;
                        }
                    } else if (state === MESSAGESTATE.CONSUME) {
                        if ((current - time) > get('config').broker.maxTime) {
                            type = STOREGETRESULT.INQUIRE;
                            return true;
                        }
                    }
                });
            }
        }
        return { result, type };
    }

    getState(type) {
    }
}

module.exports = MemoryStore;