require("colors");
const CloudHub = require("./../../index");
const FileStore = require("./../../lib/store/file");
const FileCache = require("./../../lib/cache/file");
const path = require("path");
const { get } = require("./../../lib/register");

new CloudHub({
    broker: {
        storeType: FileStore,
        storeOption: {
            path: path.resolve(__dirname, './db')
        },
        maxTime: 5000
    },
    cache: {
        cacheType: FileCache,
        cacheOption: {
            path: path.resolve(__dirname, './cache')
        },
        maxTime: 5000,
        interval: 1000
    }
}).start().then(() => {
    let { port } = get('config').server;
    console.log(`[CLOUD-HUB] SERVER START:[${port}]`.yellow);
});