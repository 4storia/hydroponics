const fs = require('fs');
const path = require('path');

const DB_FILE_PATH = path.resolve(__dirname, './tmp/store.json');

class Filestore {
    constructor() {
        try {
            fs.statSync(DB_FILE_PATH);
        } catch(err) {
            if(err.code === 'ENOENT') {
                console.log('No store found, creating', DB_FILE_PATH, '...');
                fs.writeFileSync(DB_FILE_PATH, JSON.stringify({}));

                return this._setDbContents({});
            } else {
                console.error(err);
                process.exit(1);
            }
        }

        try {
            const storeBuffer = fs.readFileSync(DB_FILE_PATH);
            const store = JSON.parse(storeBuffer.toString());

            return this._setDbContents(store);
        } catch(err) {
            console.error(err);
            process.exit(1);
        }
    }

    _setDbContents(contents) {
        this.contents = contents;
    }

    store() {
        return this.contents;
    }

    write(writePath, value) {
        const store = this.store();

        const pathChunks = writePath.split('.');
        const finalKeyName = pathChunks.pop();

        let itr = store;
        pathChunks.forEach(key => {
            if(!itr[key]) {
                itr[key] = {};
            }

            itr = itr[key];
        });

        itr[finalKeyName] = value;
        this.debouncedDiskWrite();
    }

    debouncedDiskWrite() {
        if(this.writeTimeout) {
            clearTimeout(this.writeTimeout);
        }

        this.writeTimeout = setTimeout(() => {
            this.writeToDisk();
        }, 500);
    }

    writeToDisk() {
        try {
            fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.contents, null, 4));
        } catch(err) {
            console.error(err);
        }
    }
}

module.exports = Filestore;

const f = new Filestore();
