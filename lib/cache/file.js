const Cache = require("./index");
const fileStore = require("nedb-promise");
const { SyncFile } = require("ada-util");

class FileCache extends Cache {
    constructor(option) {
        super(option);
        let { path } = option;
        let storePath = `${path}/cache.db`;
        let file = new SyncFile(storePath);
        if (!file.exist) {
            file.make();
        }
        this.store = fileStore({
            filename: storePath,
            autoload: true
        });
    }

    set(clientId, info) {
        return this.store.find({ id: clientId }).then(list => {
            if (list.length > 0) {
                let t = Object.assign({}, list[0].data, info);
                return this.store.update({ id: clientId }, { $set: { data: t } });
            } else {
                return this.store.insert({ id: clientId, data: info });
            }
        });
    }

    setPort(clientId, info) {
        return this.store.find({ id: clientId }).then(list => {
            if (list[0]) {
                let a = list[0].data.cache;
                a.push(info);
                return this.store.update({ id: clientId }, { $set: { data: list[0].data } });
            }
        });;
    }

    getPort(clientId) {
        return this.store.find({ id: clientId }).then(list => {
            if (list[0]) {
                let a = list[0].data.cache;
                let result = a.shift() || null;
                return this.store.update({ id: clientId }, { $set: { data: list[0].data } }).then(() => result);
            } else {
                return null;
            }
        });;
    }

    get(clientId) {
        return this.store.find({ id: clientId }).then(list => {
            return list[0] ? list[0].data : null;
        });
    }

    remove(clientId) {
        return this.store.remove({ id: clientId }).then(() => this.emit('clientremove'));
    }

    getAll() {
        return this.store.find({}).then(list => {
            return list.map(a => a.data);
        });
    }
}

module.exports = FileCache;