const Client = require("../client");
const { SERVERCREATETOPIC } = require("../lib/const");

Client.start({
    host: '192.168.1.2',
    port: '8085',
    name: 'normal'
}).then(({ client }) => {
    client.watch(SERVERCREATETOPIC.SERVICECHANGE, a => console.log(a));
    client.observe('test', message => {
        console.log('[normal]:', message.data);
    });
    setInterval(() => {
        client.postMessage('test', new Date().getTime()).then((a) => console.log('--> success', a), () => console.log('--> fail'));
    }, 1500);
});