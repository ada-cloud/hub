const api = require("./api");
const ConfigManager = require("../config");

const Booter = {
    _baseInfo: null,
    init() {
        if (!this.baseInfo) {
            let { cloudHub } = ConfigManager.get();
            return api.excute({ url: `${cloudHub}/baseinfo`, type: 'query', authority: true }).then(info => {
                this._baseInfo = JSON.parse(info).data;
                return info;
            });
        } else {
            return this._baseInfo;
        }
    },
    getBaseInfo() {
        return this._baseInfo;
    },
    getPublicKey() {
        return this._baseInfo.publicKey;
    },
    getServices() {
        return this._baseInfo.service;
    },
    isReady() {
        return this._baseInfo !== null;
    }
};

module.exports = Booter;