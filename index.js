const config = require("./config");
const path = require("path");
const { SyncFile, extend } = require("ada-util");
const configPath = path.resolve(process.cwd(), './cloud-hub.config.js');
const Server = require("./lib/server");
const Broker = require("./lib/broker");
const Verifier = require("ada-cloud-util/verifier");
const { set, get } = require("./lib/register");

class CloudHub {
    constructor(option) {
        let fileConfig = {};
        if (new SyncFile(configPath).exist) {
            fileConfig = require(configPath);
        }
        set('config', extend(true, {}, config, fileConfig, option));
    }

    start() {
        let { clients, rsa: { privateKey, publicKey } } = get('config');
        privateKey = new SyncFile(privateKey).read();
        publicKey = new SyncFile(publicKey).read();

        let broker = new Broker(),
            server = new Server(),
            verifier = new Verifier({ privateKey, publicKey, users: clients });
        set('server', server);
        set('broker', broker);
        set('verifier', verifier);
        return server.start();
    }
}

module.exports = CloudHub;