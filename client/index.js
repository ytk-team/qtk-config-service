const Client = require('@qtk/schema-tcp-framework').Client;
const EventEmitter = require('events').EventEmitter;
const genuuid = require('uuid/v4');

/**
 * safe to get config only after a successful call to subscribe function
 */
module.exports = class {
    constructor({host, port}) {
        this._host = host;
        this._port = port;
        this._client = undefined;
        this.config = undefined;
    }

    subscribe() {
        return new Promise((resolve, reject) => {
            if (this._client !== undefined) {
                reject(new Error(`cannot call subscribe function more than once`));
                return;
            }
            this._client = new Client({host: this._host, port: this._port});
            this._client.on('data', ({data: config}) => {
                console.log('client got config = ' + JSON.stringify(config))
                this.config = config;
                resolve();
            });
        });
    }
};