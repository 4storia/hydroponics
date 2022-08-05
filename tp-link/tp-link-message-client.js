const Net = require('node:net');
const TPLinkEncryption = require('./tp-link-encryption');

class TPLinkMessageClient {
    constructor(host, port = 9999, timeout = 9999) {
        this.host = host;
        this.port = port;
        this.timeout = timeout;
    }

    async sendMessage(message) {
        const socket = await this.createTcpSocket();
        const response = await this.sendMessageToSocket(socket, message);

        socket.end();

        return response;
    }

    async createTcpSocket () {
        const client = new Net.Socket();
        const connectionPromise = new Promise((resolve, reject) => {
            const timeoutRef = setTimeout(() => {
                reject(`Unable to connect to ${this.host}:${this.port} within ${this.timeout / 1000} seconds`);
            }, this.timeout);

            client.connect({ port: this.port, host: this.host }, function(...args) {
                clearTimeout(timeoutRef);
                resolve(client);
            });
        });

        await connectionPromise;

        return client;
    }

    async sendMessageToSocket(socket, message) {
        const payload = JSON.stringify(message);
        const encryptedPayload = TPLinkEncryption.encryptWithHeader(payload);

        let resolve;
        let reject;

        const deferred = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        })

        let responseBuffer;

        socket.on('data', (data) => {
            try {
                if(!responseBuffer) {
                    responseBuffer = data;
                } else {
                    responseBuffer = Buffer.concat([responseBuffer, data], responseBuffer.length + data.length);
                }

                if (responseBuffer.length < 4) {
                    return reject('Message too small');
                }

                const expectedResponseLength = responseBuffer.slice(0, 4).readInt32BE();
                const actualResponseLength = responseBuffer.length - 4;

                if (actualResponseLength >= expectedResponseLength) {
                    // Expected length is prepended to the message - strip it off to leave the actual encrypted message
                    const encryptedMessage = responseBuffer.slice(4);
                    const decryptedMessage = TPLinkEncryption.decrypt(encryptedMessage);
                    resolve(decryptedMessage)
                }
            } catch (err) {
                console.error('Error reading message response: ', err);
                reject(err);
            }
        });

        socket.write(encryptedPayload);

        try {
            const response = await deferred;
            return JSON.parse(response);
        } catch(err) {
            console.error(err);
            return null;
        }
    }
}

module.exports = TPLinkMessageClient;