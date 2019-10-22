const chokidar = require('chokidar');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const { execSync } = require('child_process');

module.exports = class extends EventEmitter {
    constructor(folder) {
        super();
        this._folder = path.resolve(folder);
        if (this.config) {
            throw new Error('cannot start the monitor more than once');
        }
        this.config = this._getConfig(this._folder);
        logger.info('config loaded');
        const watcher = chokidar.watch(this._folder, {
            usePolling: true
        });
        watcher.on('change', () => {
            try {
                this.config = this._getConfig(this._folder);
                logger.info('config reloaded');
                this.emit('update');
            }
            catch (err) {
                logger.error('bad config: ' + err.message);
            }
        });
    }

    _getConfig(folder) {
        let data = execSync(`node ${__dirname}/get_config.js ${folder}`);
        if (Buffer.isBuffer(data)) data = data.toString();
        if (data.startsWith('{') == false) 
            throw new Error(data);
        return JSON.parse(data);
    }

}