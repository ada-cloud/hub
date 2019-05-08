const Client = require("../client");
const { SERVERCREATETOPIC } = require("./../lib/const");

Client.start({
    host: '192.168.1.3',
    port: '8077',
    name: 'sort'
}).then(({ client }) => {
    client.watch(SERVERCREATETOPIC.SERVICECHANGE, a => console.log(a));
    client.observe('sort', message => {
        console.log('[sort]:', message);
    });
});
// setTimeout(() => {
//     let t = [];
//     for (let i = 0; i < 10; i++) {
//         t.push(i);
//     }
//     t.reduce((a, num) => {
//         return a.then(() => client.postSortMessage('sort', `sort:${num}`).then(() => console.log('success'), () => console.log('fail')));
//     }, Promise.resolve());
// }, 2000);