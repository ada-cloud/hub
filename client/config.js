require("colors");
const { SyncFile, extend } = require("ada-util");
const got = require("got");
const path = require("path");
const Verifier = require("cloud-util/verifier");

const Config = {
    name: 'test',
    protocol: 'http:',
    host: '192.168.1.1',
    port: '8089',
    token: '',
    ready: false,
    loadBalance: 'random',
    cloudHub: 'http://localhost:6080',
    username: 'test',
    password: '123456'
};

const ConfigManager = {
    _loginPs: null,
    set(info) {
        extend(true, Config, info);
    },
    get() {
        if (!Config.ready) {
            Config.ready = true;
            let configPath = path.resolve(process.cwd(), './cloud-hub.client.config.js');
            if (new SyncFile(configPath).exist) {
                extend(Config, require(configPath));
            }
        }
        return Config;
    },
    login() {
        if (!this._loginPs) {
            console.log('[CLOUD-HUB] CLIENT LOGIN'.yellow);
            let { host, protocol, name, port, username, password, cloudHub } = Config;
            console.log('LOGIN:',name,host,port);
            this._loginPs = new Promise((resolve, reject) => {
                return got(`${cloudHub}/login`, {
                    body: { username, password: Verifier.getPassword(password), host, protocol, name, port },
                    json: true
                }).then(({ body }) => {
                    this._loginPs = null;
                    let { code, data } = body;
                    if (code === 0) {
                        Config.token = data;
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        }
        return this._loginPs;
    },
    getToken() {
        if (!Config.token) {
            return this.login().then(() => Config.token);
        } else {
            return Promise.resolve(Config.token);
        }
    },
    getHeaders() {
        return this.getToken().then(token => {
            return {
                Authorization: `Bearer ${Config.token}`
            };
        });
    }
}

module.exports = ConfigManager;