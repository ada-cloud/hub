const uuid = require("uuid/v1");
const { parse } = require("./message");

const util = {
    uuid() {
        return uuid();
    },
    parseRequest(request) {
        return new Promise((resolve, reject) => {
            let body = [];
            request.on('error', (err) => {
                reject(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                resolve(Buffer.concat(body).toString());
            });
        });
    },
    parseRequestMessage(request) {
        return new Promise((resolve, reject) => {
            let body = [];
            request.on('error', (err) => {
                reject(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                resolve(parse(Buffer.concat(body).toString()));
            });
        });
    },
    writeResponse(response, code, data) {
        response.writeHead(code, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(data));
    }
};

module.exports = util;