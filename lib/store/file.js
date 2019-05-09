const Store = require("./index");
const { MESSAGESTATE, PRODUCERMETHODTYPES, STOREGETRESULT } = require("./../const");
const { get } = require("./../register");
const fileStore = require("nedb-promise");
const { SyncFile } = require("ada-util");
const md5 = require("md5");
class FileStore extends Store {
    constructor(option) {
        super(option);
        this.map = {};
    }

    getStorePath(topic, method) {
        let { path } = this.option;
        return `${path}/${topic}-${method}.db`;
    }

    getDB(topic, method) {
        let path = this.getStorePath(topic, method);
        if (!this.map[path]) {
            let file = new SyncFile(path);
            if (!file.exist) {
                file.make();
            }
            this.map[path] = fileStore({
                filename: path,
                autoload: true
            });
        }
        return this.map[path];
    }

    add(record) {
        let { topic, method } = record;
        return this.getDB(topic, method).insert(record.getRecord());
    }

    set({ path, topic, state }) {
        let db = this.getDB(topic, PRODUCERMETHODTYPES.STATE);
        return db.find({ path }).then(list => {
            if (list.length > 0) {
                return db.update({ path }, { $set: { state } });
            }
        });
    }

    remove(path) {
        let [topic, method, id] = path.split("/");
        let db = this.getDB(topic, method);
        return db.remove({ path });
    }

    push(record) {
        let { topic } = record;
        return this.getDB(topic, PRODUCERMETHODTYPES.SORT).insert(record.getRecord());
    }

    shift(topic) {
        let result = null, type = STOREGETRESULT.NOTHING;
        let db = this.getDB(topic, PRODUCERMETHODTYPES.SORT);
        return db.find({}).then(list => {
            list = list.sort((a, b) => (a.time - b.time));
            let a = list[0], current = new Date().getTime();
            if (a && a.state === MESSAGESTATE.READY) {
                type = STOREGETRESULT.DONE;
                result = a;
                return db.update({ path: a.path }, { $set: { state: MESSAGESTATE.CONSUME } });
            } else if (a && ((current - a.time) > get('config').broker.maxTime)) {
                result = a;
                type = STOREGETRESULT.INQUIRE;
            }
        }).then(() => {
            return { result, type };
        });
    }

    state(topic) {
        let result = null, type = STOREGETRESULT.NOTHING;
        let db = this.getDB(topic, PRODUCERMETHODTYPES.STATE);
        return db.find({}).then(area => {
            if (area) {
                let current = new Date().getTime();
                result = area.find(record => {
                    let { time, state } = record;
                    if (state === MESSAGESTATE.READY) {
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
                if (result && result.state === MESSAGESTATE.READY) {
                    return db.update({ path: result.path }, { $set: { state: MESSAGESTATE.CONSUME } });
                }
            }
        }).then(() => {
            return { result, type };
        });
    }

    get(topic) {
        let result = null, type = STOREGETRESULT.NOTHING;
        let db = this.getDB(topic, PRODUCERMETHODTYPES.NORMAL);
        return db.find({}).then(area => {
            if (area) {
                let current = new Date().getTime();
                result = area.find(record => {
                    let { time, state } = record;
                    if (state === MESSAGESTATE.READY) {
                        type = STOREGETRESULT.DONE;
                        return true;
                    } else if (state === MESSAGESTATE.CONSUME) {
                        if ((current - time) > get('config').broker.maxTime) {
                            type = STOREGETRESULT.INQUIRE;
                            return true;
                        }
                    }
                });
                if (result && result.state === MESSAGESTATE.READY) {
                    return db.update({ path: result.path }, { $set: { state: MESSAGESTATE.CONSUME } });
                }
            }
        }).then(() => {
            return { result, type };
        });
    }

    timeup(topic) {
        let result = null, type = STOREGETRESULT.NOTHING;
        let db = this.getDB(topic, PRODUCERMETHODTYPES.TIMMER);
        return db.find({}).then(area => {
            if (area) {
                let current = new Date().getTime();
                result = area.find(record => {
                    let { timmer, time, state } = record;
                    if (state === MESSAGESTATE.TIMMER) {
                        if (current <= timmer) {
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
                if (result && result.state === MESSAGESTATE.TIMMER) {
                    return db.update({ path: result.path }, { $set: { state: MESSAGESTATE.CONSUME } });
                }
            }
        }).then(() => {
            return { result, type };
        });
    }

    getState(type) {
    }
}

module.exports = FileStore;