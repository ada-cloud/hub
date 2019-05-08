const http = require("http");
const URL = require("url");
const ClientManager = require("./manager");
const { get } = require("./../register");
const { writeResponseMessage } = require("./../helper");
const { served } = require("./../message");
const Controller = require("./controller");
const { debug } = require("./../const");

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
                        writeResponseMessage(response, 200, new served.NeedloginMessage());
                    }
                } else {
                    ps = ps.then(() => action({ request, response, clientManager: this.clientManager }));
                }
                ps.catch(e => {
                    debug(e);
                    writeResponseMessage(response, 500, new served.ErrorMessage(e));
                });
            } else {
                writeResponseMessage(response, 500, new served.ErrorMessage('bad request!'));
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