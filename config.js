const path = require("path");
const MemoryStore = require("./lib/store/memory");
const MemoryCache = require("./lib/cache/memory");

module.exports = {
    server: {
        port: 6080,
        host: "127.0.0.1"
    },
    broker: {
        storeType: MemoryStore,
        storeOption: {
            path: path.resolve(__dirname, './test/db')
        },
        maxTime: 5000
    },
    cache: {
        cacheType: MemoryCache,
        cacheOption: {},
        maxTime: 20000,
        interval: 3000
    },
    manager: {
        timeout: 5000,
        interval: 500
    },
    rsa: {
        privateKey: path.resolve(__dirname, './test/keys/rsa.private'),
        publicKey: path.resolve(__dirname, './test/keys/rsa.public')
    },
    clients: {
        test: '123456'
    }
};