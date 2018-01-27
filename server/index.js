const Server = require('@qtk/schema-tcp-framework').Server;
const log4js = require('log4js');
const Subscriber = require('./subscriber');
const Monitor = require('./monitor');
const assert = require('assert');
const genuuid = require('uuid/v4');

module.exports = class  {
	constructor({host, port, configPath, logPath}) {
        log4js.configure({
            appenders: {
                runtime: logPath ? {
                    type: 'dateFile',
                    filename: `${logPath}/`,
                    pattern: "yyyy-MM-dd.log",
                    alwaysIncludePattern: true
                } : {
                    type: 'console'
                }
            },
            categories: {
                default: { appenders: ['runtime'], level: "ALL" }
            }
        });
        global.logger = log4js.getLogger();

        const monitor = new Monitor(configPath);
        monitor.on('update', () => {
            for (const socket of Subscriber.retrieveAll()) {
                this._server.send(socket, {uuid: genuuid().replace(/-/g, ''), data: monitor.config});
            }
        });

        this._server = new Server({host: host, port: port});
        this._server.on("connected", (socket) => {
            Subscriber.add(socket);
            this._server.send(socket, {uuid: genuuid().replace(/-/g, ''), data: monitor.config});
        });
        this._server.on("closed", (socket) => {
            Subscriber.remove(socket);
        });
        this._server.on("exception", (socket, error) => {
            logger.error(`exception occurred at client(${socket.remoteAddress}:${socket.remotePort}): ${error.stack}`);
        });
    }

    start() {
        this._server.start();
    }
};
