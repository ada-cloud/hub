const Client = require("../client");
const { SERVERCREATETOPIC } = require("./../lib/const");

Client.getClient().then(client => {
    client.observe('test', message => {
        console.log('[normal]:', message);
    });
    client.watch(SERVERCREATETOPIC.SERVICECHANGE, a => console.log(a));
    setInterval(() => {
        client.postMessage('test', new Date().getTime()).then((a) => console.log('--> success', a), () => console.log('--> fail'));
    }, 1500);
});
