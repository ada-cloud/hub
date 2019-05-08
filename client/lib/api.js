const got = require("got");
const ConfigManager = require("../config");
const { SERVERPOSTTYPES } = require("../../lib/const");
const Fuse = require("cloud-util/fuse");

const API = {
    put(message) {
        let { cloudHub } = ConfigManager.get();
        return this.excute({
            url: `${cloudHub}/set`,
            authority: true,
            type: 'json',
            data: message.getInfo()
        });
    },
    get(topic) {
        let { cloudHub } = ConfigManager.get();
        return this.excute({
            url: `${cloudHub}/get`,
            authority: true,
            type: 'json',
            data: topic
        });
    },
    quit() {
        let { cloudHub } = ConfigManager.get();
        return this.excute({
            url: `${cloudHub}/quit`,
            authority: true,
            type: 'json'
        });
    },
    excute({ url, authority = false, type = 'json', data = {}, headers = {}, retryTime = 5, timeout = 50000 }) {
        let ps = Promise.resolve();
        if (authority) {
            ps = ps.then(() => ConfigManager.getToken());
        }
        return ps.then((token) => {
            let ops = {};
            ops.timeout = timeout;
            if (authority) {
                ops.headers = Object.assign(headers, {
                    Authorization: `Bearer ${token}`
                });
            } else {
                ops.headers = headers;
            }
            if (type === 'json') {
                Object.assign(ops, { body: data, json: true });
            } else if (type === 'query') {
                let query = new URLSearchParams(Reflect.ownKeys(data).map(key => {
                    return [key, data[key]];
                }));
                Object.assign(ops, { query });
            } else if (type === 'form') {
                Object.assign(ops, { body: data, form: true });
            }
            return new Fuse(() => {
                return new Promise((resolve, reject) => {
                    return got(url, ops).then(({ body }) => {
                        let { type } = body;
                        if (type === SERVERPOSTTYPES.NEEDLOGIN) {
                            ConfigManager.getToken().then(token => {
                                ops.headers['Authorization'] = `Bearer ${token}`;
                                reject();
                            }).catch(e => reject());
                        } else {
                            resolve(body);
                        }
                    }).catch(e => {
                        console.log(e);
                        reject();
                    });
                });
            }, { retryTime }).excute();
        });
    }
};

module.exports = API;