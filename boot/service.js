const path = require("path");
const Client = require("./../client");
const { SyncFile } = require("ada-util");
const configPath = path.resolve(process.cwd(), './app.config.json');
const EventEmiter = require("events");
const { Boost } = require("ada-cloud-util/boost");

class CloudService extends EventEmiter {
    constructor() {
        super();
        let fileConfig = {};
        if (new SyncFile(configPath).exist) {
            fileConfig = require(configPath);
        }
        this._config = Object.assign({}, {
            name: '',
            protocol: '',
            host: '',
            port: '',
            cloudHub: 'http://localhost:6080',
            username: 'test',
            password: '123456'
        }, fileConfig);
        this._channel = null;
        this._service = null;
    }

    get config() {
        return this._config;
    }

    get channel() {
        return this._channel;
    }

    get service() {
        return this._service;
    }

    getRemoteConfigInfo(service) {
        return {};
    }

    startup(initialize) {
        return new Promise((resolve, reject) => {
            Client.setConfig(this.config);
            return Client.getService().then(service => {
                return Promise.resolve().then(() => this.getRemoteConfigInfo(service)).then(config => Object.assign(this.config, config || {}));
            }).then(() => {
                this.emit('beforestart');
                let ps = Promise.resolve();
                if (initialize) {
                    ps = ps.then(() => Promise.resolve().then(() => initialize(this)));
                }
                ps = ps.then(() => {
                    return Boost.boot({
                        source: path.resolve(process.cwd(), this.config.source),
                        server: this
                    });
                });
                return ps.then(() => {
                    return Client.start(this.config).then(({ client, service }) => {
                        client.watch('cloud-config-change', () => {
                            Promise.resolve().then(() => this.getRemoteConfigInfo(service)).then(config => {
                                Object.assign(this.config, config || {});
                                this.emit('configchange');
                            });
                        });
                        this._channel = client;
                        this._service = service;
                        this.emit('started', this);
                        resolve(this);
                    });
                });
            }).catch(e => reject(e));
        });
    }
}

module.exports = CloudService;