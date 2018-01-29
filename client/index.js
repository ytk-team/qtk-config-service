const Client = require('@qtk/schema-tcp-framework').Client;
const EventEmitter = require('events').EventEmitter;
/**
 * event : ready 
 * event : update
 */
module.exports = class extends EventEmitter {
    constructor({host, port}) {
        super();
        this.config = undefined;
        this._ready = false;
        const client = new Client({host, port});
        client.on('data', ({data: config}) => {
            this.config = config;
            if (!this._ready) {
                this._ready = true;
                this.emit('ready');
            }
            else {
                this.emit('update');
            }
        });
    }
};
