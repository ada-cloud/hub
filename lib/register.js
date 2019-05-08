const REG = {
    server: null,
    broker: null,
    verifier: null,
    config: {}
};

module.exports = {
    set(key, value) {
        REG[key] = value;
    },
    get(key) {
        return REG[key];
    }
};