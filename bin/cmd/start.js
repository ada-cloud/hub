require("colors");
let Server = require("./../../index");
let { get } = require("./../../lib/register");

module.exports = {
    command: "start",
    desc: "start cloud hub server",
    paras: [],
    fn: function () {
        new Server().start().then(() => {
            let { port } = get('config').server;
            console.log(`[CLOUD-HUB] SERVER START:[${port}]`.yellow);
        });
    }
};