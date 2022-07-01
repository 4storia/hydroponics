const { Board, Thermometer } = require('johnny-five');

const board = new Board({ repl: false });

const PINS = {
    TEMPERATURE: {
        value: 0,
        pin: 3
    }
};

function onReady() {
    const t = new Thermometer({
        controller: 'DS18B20',
        freq: 100,
        pin: 'A3'
    });

    t.enable();
    t.on('change', console.log);
}

board.on('ready', onReady)