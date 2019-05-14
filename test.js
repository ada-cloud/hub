const Server = require("./index");

new Server().start().then(() => console.log('-> start <-'));