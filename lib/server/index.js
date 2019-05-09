const http = require("http");
const URL = require("url");
const ClientManager = require("./manager");
const { get } = require("./../register");
const { writeResponse } = require("./../helper");
const Controller = require("./controller");
const { debug } = require("./../const");
const BaseError = require("ada-cloud-util/error");
const Result = require("ada-cloud-util/result");

class Server {
    constructor() {
        this._clientManager = new ClientManager();
        this._server = http.createServer((request, response) => {
            let { url, method, headers } = request, { pathname } = URL.parse(url, true);
            let actionName = `${method.toLowerCase()}_${pathname.substring(1)}`, target = Controller[actionName];
            if (target) {
                let { authority, action } = target, ps = Promise.resolve();
                if (authority) {
                    let { authorization } = headers, clientInfo = null, token = (authorization ? authorization.split(" ")[1] : '');
                    if (token) {
                        clientInfo = get('verifier').verifyToken(token);
                    }
                    if (clientInfo) {
                        ps = ps.then(() => action({ request, response, clientInfo, clientManager: this.clientManager }));
                    } else {
                        writeResponse(response, 200, Result.getLoginResult().getResponseData());
                    }
                } else {
                    ps = ps.then(() => action({ request, response, clientManager: this.clientManager }));
                }
                ps.catch(e => {
                    if (e && e instanceof BaseError) {
                        writeResponse(response, 200, Result.getErrorResult(e.message).getResponseData());
                    } else {
                        debug(e);
                        writeResponse(response, 500, Result.getErrorResult(e.message).getResponseData());
                    }
                });
            } else {
                writeResponse(response, 500, Result.getErrorResult('bad request!').getResponseData());
            }
        });
    }

    get clientManager() {
        return this._clientManager;
    }

    start() {
        let { port, host } = get('config').server;
        return new Promise((resolve, reject) => {
            this._clientManager.init().then(() => this._server.listen(port, host, () => resolve())).catch(() => reject());
        });
    }
}
module.exports = Server;