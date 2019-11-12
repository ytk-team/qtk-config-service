const chokidar = require('chokidar');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const { spawn } = require('child_process');

module.exports = class extends EventEmitter {
    constructor(folder) {
        super();
        this._folder = path.resolve(folder);
        if (this.config) {
            throw new Error('cannot start the monitor more than once');
        }
        this.config = require(this._folder);
        logger.info('config loaded');
        const watcher = chokidar.watch(this._folder, {
            usePolling: true
        });

        let shakeKeeper = undefined;
        watcher.on('change', async() => {
            if (shakeKeeper !== undefined) clearTimeout(shakeKeeper);
            shakeKeeper = setTimeout(async() => {
                try {
                    this.config = await this._getConfig(this._folder);
                    logger.info('config reloaded');
                    this.emit('update');
                }
                catch (err) {
                    logger.error('bad config: ' + err.message);
                }
            }, 1000);
        });
    }

    _getConfig(folder) {
        return new Promise((resolve, reject) => {
            const get = spawn('node', [`${__dirname}/get_config.js`, folder]);
 
            let chunks = [];
            let errChunks = [];
    
            get.stdout.on('data', data => {
                chunks.push(data);
            });
            
            get.stderr.on('data', data => errChunks.push(data));
    
            get.on('close', code => {
                try {
                    if (code !== 0) {
                        return reject(
                            new Error(
                                errChunks
                                    .reduce((prev ,curr) => {
                                        prev = Buffer.concat([prev, curr]);
                                        return prev;
                                    }, Buffer.from([]))
                                    .toString()
                            )
                        );
                    }
        
                    return resolve(
                        JSON.parse(
                            chunks
                                .reduce((prev ,curr) => {
                                    prev = Buffer.concat([prev, curr]);
                                    return prev;
                                }, Buffer.from([]))
                                .toString()
                        )
                    );
                }
                catch(error) {
                    return reject(error);
                }

            });
        });
    }

}