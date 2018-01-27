const fs = require('fs');
const path = require('path');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {
    constructor(folder) {
        super();
        folder = path.resolve(folder);
        if (this.config) {
            throw new Error('cannot start the monitor more than once');
        }
        this.config = require(folder);
        logger.info('config loaded');
        fs.watch(folder, async () => {
            this._purge(folder);
            let config = null;
            try {
                config = require(folder);
            }
            catch(err) {
                logger.error('bad config: ' + err.message);
                return;
            }
            this.config = config;
            logger.info('config reloaded');
            this.emit('update');
        });
    }

    _purge(folder) {
        this._search(folder, function (mod) {
            delete require.cache[mod.id];
        });
    
        Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
            if (cacheKey.indexOf(folder)>0) {
                delete module.constructor._pathCache[cacheKey];
            }
        });
    }

    _search(folder, callback) {
        let mod = require.resolve(folder);
        if (mod && ((mod = require.cache[mod]) !== undefined)) {
            (function traverse(mod) {
                mod.children.forEach(function (child) {
                    traverse(child);
                });
                callback(mod);
            }(mod));
        }
    };
}