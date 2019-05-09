const Client = require("../client");
const { SERVERCREATETOPIC } = require("../lib/const");

Client.start({
    host: '192.168.1.2',
    port: '8080',
    name: 'normal'
}).then(({ client }) => {
    // client.watch(SERVERCREATETOPIC.SERVICECHANGE, a => console.log(a));
    client.observe('timmer', message => {
        console.log(message.data);
    });
    client.postTimmerMessage('timmer', new Date().getTime() + 5000, { name: "timmer" }).then((a) => console.log('--> success', a), (e) => console.log('--> fail', e));
}).catch(e => console.log(e));