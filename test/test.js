const Server = require('../server');
const Client = require('../client');
const assert = require('assert');
const host = "127.0.0.1";
const port = 10000;
const configPath = `${__dirname}/../example`;
const fs = require('fs');

function waitForReady(client) {
    return new Promise((resolve, reject) => {
        client.on('ready', () => {
            resolve();
        });
    });
}

describe('#register-service', async function() {
    this.timeout(10000);
    before(async function() {
        let server = new Server({host, port, configPath});
        server.start();
        this.client = new Client({host, port});
        await waitForReady(this.client);
        await sleep(); //刚启动里面更新会捕获不到更新事件
    })

    describe("retrieving config", function() {
        let content = "";
        it("should return without error", async function() {
            assert(this.client.config.sys.port === 1234, 'config mismatch');
        });
        it("should return the latest config", async function() {
            this.timeout(20000);

            content = fs.readFileSync(`${configPath}/sys/index.js`, 'utf8');
            content = content.replace(/localhost/g, 'remotehost');
            fs.writeFileSync(`${configPath}/sys/index.js`, content);
            await sleep();
            assert(this.client.config.sys.host === 'remotehost', 'config mismatch');
            
            content = content.replace(/remotehost/g, 'localhost');
            fs.writeFileSync(`${configPath}/sys/index.js`, content);
            await sleep();
            assert(this.client.config.sys.host === 'localhost', 'config mismatch');
        });

        after(async function() {
            fs.writeFileSync(`${configPath}/sys/index.js`, `module.exports = {
    host: 'localhost',
    port: 1234
}`      );
        })
    });


});

function sleep() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {resolve()}, 1000);
    })
}