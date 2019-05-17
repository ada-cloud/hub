const Koa = require("koa");
const path = require("path");
const Client = require("./../client");
const PublicVerifier = require("ada-cloud-util/verifier/public");
const { SyncFile } = require("ada-util");
const { debug } = require("./../lib/const");
const configPath = path.resolve(process.cwd(), './app.config.json');
const { Boost } = require("ada-cloud-util/boost");

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

    getDatabaseOption(datasourceName) {
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
                    return Boost.boot({
                        source: path.resolve(process.cwd(), this.config.source),
                        server: this
                    });
                });
                return ps.then((BoostContext) => {
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
                                BoostContext.setContextInfo({
                                    serviceVerifier: new PublicVerifier(booter.getPublicKey()),
                                    channel: client,
                                    service
                                });
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