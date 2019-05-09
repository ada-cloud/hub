const md5 = require("md5");
const debug = require("debug");

const CLIENTSENDMESSAGETYPES = {
    PRODUCER: 'producer',
    RESOLVE: 'resolve',
    PRODUCERSTATE: 'producerstate',
    PRODUCERSETSTATE: 'producersetstate',
    BROADCAST: 'broadcastmes',
    TIMMER: 'timmer'
};

const SERVERSENDMESSAGETYPES = {
    CONSUMER: 'consumer',
    INQUIRE: 'inquire',
    TIMEOUT: 'timeout',
    BROADCAST: 'broadcast'
};

const MESSAGESTATE = {
    READY: 'ready',
    CONSUME: "consume",
    PREPARE: 'prepare',
    TIMMER: 'timmer'
};

const PRODUCERMETHODTYPES = {
    NORMAL: 'normal',
    SORT: 'sort',
    STATE: 'state',
    BROADCAST: 'broadcast',
    TIMMER: 'timmer'
};

const PASSWORDSECRITCODE = 'cloudhub_password_decrypt_screct_code';

const STOREGETRESULT = {
    DONE: 'done',
    INQUIRE: 'inquire',
    NOTHING: 'nothing'
};

const SERVERCREATETOPIC = {
    SERVICECHANGE: 'cloud-service-change'
};

module.exports = {
    CLIENTSENDMESSAGETYPES,
    SERVERSENDMESSAGETYPES,
    MESSAGESTATE,
    PRODUCERMETHODTYPES,
    PASSWORDSECRITCODE,
    STOREGETRESULT,
    SERVERCREATETOPIC,
    PASSWORD(password) {
        return md5(`#${password}#${PASSWORDSECRITCODE}`);
    },
    CACHEID({ protocol, host, port, name }) {
        return md5(`${protocol}//${host}:${port}/${name}`);
    },
    debug: debug('ADA:CLOUD-HUB')
};