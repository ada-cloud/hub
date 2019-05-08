require("colors");
const quickEncrypt = require('quick-encrypt');
const { File } = require("ada-util");
const path = require("path");

module.exports = {
    command: "rsa",
    desc: "generate private-public key file to pwd",
    paras: [],
    fn: function () {
        let { private, public } = quickEncrypt.generate(2048);
        new File(path.resolve(process.cwd(), './rsa.private')).write(private).then(() => {
            return new File(path.resolve(process.cwd(), './rsa.public')).write(public);
        }).then(() => {
            console.log(`[CLOUD-HUB] ALL DONE`.yellow);
        });
    }
};