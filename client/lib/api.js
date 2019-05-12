const got = require("got");
const ConfigManager = require("../config");
const Fuse = require("ada-cloud-util/fuse");
const { RESULTCODE } = require("ada-cloud-util/result/const")

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
        let ps = Promise.resolve(), abort = null, isAbort = false;
        if (authority) {
            if (!isAbort) {
                ps = ps.then(() => ConfigManager.getToken());
            }
        }
        ps = ps.then((token) => {
            if (!isAbort) {
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
                let psx = new Fuse(() => {
                    return new Promise((resolve, reject) => {
                        return got(url, ops).then(({ body }) => {
                            let { type } = body;
                            if (type === RESULTCODE.NEEDLOGIN) {
                                ConfigManager.getToken().then(token => {
                                    ops.headers['Authorization'] = `Bearer ${token}`;
                                    reject();
                                }).catch(e => reject());
                            } else {
                                resolve(body);
                            }
                        }).catch(e => {
                            reject(e);
                        });
                    });
                }, { retryTime }).excute();
                abort = () => {
                    psx.abort();
                }
                return psx;
            } else {
                return Promise.resolve({});
            }
        });
        ps.abort = () => {
            isAbort = true;
            abort && abort();
        }
        return ps;
    }
};

module.exports = API;