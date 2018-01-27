const Server = require('../server');
const Client = require('../client');
const assert = require('assert');
const host = "127.0.0.1";
const port = 10000;
const configPath = `${__dirname}/../example`;
const fs = require('fs');

describe('#register-service', function() {
    before(function() {
        let server = new Server({host, port, configPath});
        server.start();
        this.client = new Client({host, port});
    })

    describe("retrieving config", function() {
        it("should return without error", async function() {
            await this.client.subscribe();
            assert(this.client.config.sys.port === 1234, 'config mismatch');
        });
        it("should return the latest config", async function() {
            this.timeout(5000);

            let content = fs.readFileSync(`${configPath}/index.js`, 'utf8');
            content = content.replace(/localhost/g, 'remotehost');
            fs.writeFileSync(`${configPath}/index.js`, content);
            await sleep();
            assert(this.client.config.sys.host === 'remotehost', 'config mismatch');
            
            content = content.replace(/remotehost/g, 'localhost');
            fs.writeFileSync(`${configPath}/index.js`, content);
            await sleep();
            assert(this.client.config.sys.host === 'localhost', 'config mismatch');
        });
    });
});

function sleep() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {resolve()}, 1500);
    })
}