const Koa = require("koa");
const path = require("path");
const Client = require("./../client");
const PublicVerifier = require("ada-cloud-util/verifier/public");
const Result = require("ada-cloud-util/result");
const { SyncFile } = require("ada-util");
const { debug } = require("./../lib/const");
const configPath = path.resolve(process.cwd(), './app.config.json');
const { Boost, Service } = require("ada-cloud-util/boost");

class Server extends Koa {
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
            password: '123456',
            source: './src'
        }, fileConfig);
    }

    get config() {
        return this._config;
    }

    listen(...args) {
        throw Error('[ADA-CLOUD] listen() not support,use startup() instead');
    }

    getRemoteConfigInfo(service) {
        return {};
    }

    getDatabaseConfigure() {
        return {};
    }

    startup(initialize) {
        return new Promise((resolve, reject) => {
            Client.setConfig(this.config);
            return Client.getService().then(service => {
                return Promise.resolve().then(() => this.getRemoteConfigInfo(service)).then(config => Object.assign(this.config, config || {}));
            }).then(() => {
                this.emit('beforestart');
                debug(`Service startup [ ${this.config.port} ]`);
                let ps = Promise.resolve();
                if (initialize) {
                    ps = ps.then(() => Promise.resolve().then(() => initialize(this)));
                }
                ps = ps.then(() => {
                    this.context.Service = Service;
                    return Boost.boot({
                        source: path.resolve(process.cwd(), this.config.source),
                        database: this.getDatabaseConfigure(),
                        server: this
                    });
                });
                return ps.then(() => {
                    super.listen(this.config.port, (err) => {
                        if (!err) {
                            return Client.start(this.config).then(({ client, service, booter }) => {
                                client.watch('cloud-config-change', () => {
                                    Promise.resolve().then(() => this.getRemoteConfigInfo(service)).then(config => {
                                        Object.assign(this.config, config || {});
                                        Boost.updateDatabase(this.getDatabaseConfigure());
                                        this.emit('configchange');
                                    });
                                });
                                this.context.publicVerifier = new PublicVerifier(booter.getPublicKey());
                                this.context.channel = client;
                                this.context.service = service;
                                this.context.booster = booter;
                                this.context.config = this.config;
                                this.context.result = Result;
                                this.emit('started', this);
                                resolve(this);
                            });
                        } else {
                            reject(err);
                        }
                    });
                });
            }).catch(e => reject(e));
        });
    }
}

module.exports = Server;