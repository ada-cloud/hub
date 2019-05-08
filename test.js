// const jwt = require('jsonwebtoken');
// const { SyncFile } = require("ada-util");
// const path = require("path");

// let privateKey = new SyncFile(path.resolve(__dirname, "./test/keys/rsa.private")).read();
// let publicKey = new SyncFile(path.resolve(__dirname, "./test/keys/rsa.public")).read();

// let token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' });

// console.log(token);

// let result = jwt.verify(token, publicKey);
// console.log(result);

let { LoadBalance, BalanceTypes } = require("./util/balance");
let list = [
    { id: '1', weight: 1 },
    { id: '2', weight: 2 },
    { id: '3', weight: 5 },
    { id: '4', weight: 4 },
    { id: '5', weight: 1 }
];
console.log('Randmon:');
let balance = new LoadBalance(BalanceTypes.RANDOM, list);
for (let i = 0; i < 20; i++) {
    console.log(balance.getService().id);
}

console.log('WeightRandom');
balance = new LoadBalance(BalanceTypes.WEIGHTRANDOM, list);
for (let i = 0; i < 20; i++) {
    console.log(balance.getService().id);
}

console.log('RoundRobin');
balance = new LoadBalance(BalanceTypes.ROUNDROBIN, list);
for (let i = 0; i < 20; i++) {
    console.log(balance.getService().id);
}

console.log('WeightRoundRobin');
balance = new LoadBalance(BalanceTypes.WEIGHTROUNDROBIN, list);
for (let i = 0; i < 20; i++) {
    console.log(balance.getService().id);
}
