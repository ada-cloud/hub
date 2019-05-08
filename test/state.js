const Client = require("../client");
const { SERVERCREATETOPIC } = require("./../lib/const");

Client.start({
    host: '192.168.1.4',
    port: '8787'
}).then(({ client }) => {
    client.watch(SERVERCREATETOPIC.SERVICECHANGE, a => console.log(a));
    client.observe('test', message => {
        console.log('[normal]:', message);
    });

    client.postStateMessage("test", new Date().getTime).then(poster => {
        [1, 2, 3].reduce((a, num) => {
            return a.then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        console.log('=>', num);
                        poster.setState(num).then(() => resolve());
                    }, 1000);
                });
            });
        }, Promise.resolve()).then(() => {
            console.log('=======>1');
            poster.complete();
        });
    });
});