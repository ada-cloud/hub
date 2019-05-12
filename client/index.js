const Booster = require("./lib/booter");
const Client = require("./lib/client");
const Service = require("./lib/service");
const Config = require('./config');
const { SERVERCREATETOPIC } = require("./../lib/const");
const exitHook = require('async-exit-hook');

let service = null;
let client = null;

const ClientManager = {
    setConfig(config) {
        Config.set(config);
    },
    getBooster() {
        return Booster.init().then(() => Booster);
    },
    getService() {
        if (!service) {
            return Booster.init().then(() => {
                service = new Service();
                service.setService(Booster.getServices());
                return service;
            });
        } else {
            return Promise.resolve(service);
        }
    },
    getClient() {
        if (!client) {
            return this.getService().then(_service => {
                client = new Client();
                client.watch(SERVERCREATETOPIC.SERVICECHANGE, ({ data }) => _service.setService(data));
                return client;
            });
        } else {
            return Promise.resolve(client);
        }
    },
    start(config) {
        this.setConfig(config);
        return this.getClient().then(() => {
            return { client, service, booter: Booster };
        });
    }
};

exitHook(callback => {
    if (client) {
        client.quit().then(() => callback()).catch(() => callback());
    } else {
        callback();
    }
});

module.exports = ClientManager;