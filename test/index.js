const Client = require("../client");
const { SERVERCREATETOPIC } = require("../lib/const");

Client.start({
    host: '192.168.1.2',
    port: '8080',
    name: 'normal',
    cloudHub: 'http://localhost:6080',
    username: 'test',
    password: '123456',
}).then(({ client }) => {
    client.watch(SERVERCREATETOPIC.SERVICECHANGE, a => console.log(a));
});