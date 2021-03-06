const { LoadBalance, BalanceTypes } = require("ada-cloud-util/balance");
const Fuse = require("ada-cloud-util/fuse");
const api = require("./api");
const { debug } = require("./../../lib/const");

class RegisterService {
    constructor(client) {
        this._client = client;
        this._service = {};
    }

    setService(data = []) {
        let services = {};
        data.forEach(service => {
            let name = service.name;
            if (!services[name]) {
                services[name] = [];
            }
            services[name].push(service);
        });
        Reflect.ownKeys(services).forEach(key => {
            let list = services[key];
            if (!this._service[key]) {
                this._service[key] = new LoadBalance(BalanceTypes.ROUNDROBIN, list);
            } else {
                this._service[key].updateServiceList(list);
            }
        });
    }

    _excute(path, data = {}, type = 'json', { headers = {}, timeout = 50000, retryTime = 5 } = {}) {
        if (path[0] === '/') {
            path = path.substring(1);
        }
        let a = path.split('/');
        let serviceName = a.shift();
        return new Fuse(() => {
            let target = this._service[serviceName];
            if (target) {
                let targetService = target.getService();
                if (targetService) {
                    let { protocol, host, port } = targetService;
                    let url = `${protocol}//${host}:${port}/${a.join("/")}`;
                    return api.excute({ url, authority: true, type, data, headers, retryTime, timeout });
                } else {
                    return Promise.reject();
                }
            } else {
                return Promise.reject();
            }
        }, { retryTime }).excute();
    }

    _parseResult(r) {
        if (r[0] === '[' || r[0] === '{') {
            try {
                r = JSON.parse(r);
            } catch (e) {
            }
        }
        return r;
    }

    post(path, data = {}, ops = {}) {
        debug(`service.post:${path}`);
        return this._excute(path, data, 'json', ops).then(r => this._parseResult(r));
    }

    postForm(path, data = {}, ops = {}) {
        debug(`service.postForm:${path}`);
        return this._excute(path, data, 'form', ops).then(r => this._parseResult(r));
    }

    get(path, data = {}, ops = {}) {
        debug(`service.get:${path}`);
        return this._excute(path, data, 'query', ops).then(r => this._parseResult(r));
    }
}

module.exports = RegisterService;