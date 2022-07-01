const { Board, Pin } = require('johnny-five');

const board = new Board({ repl: false });

const PINS = {
    POWER: {
        value: 0,
        pin: 53
    }
};

const FIFTEEN_MINUTES = 1000 * 60 * 15;

function onReady() {
    board.pinMode(53, Pin.OUTPUT);

    timeLoop();
    const runningInterval = setInterval(timeLoop, FIFTEEN_MINUTES);
}

function onExit() {
    board.pinMode(53, Pin.OUTPUT);
    board.digitalWrite(53, 0);
}

function timeLoop() {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US')}`;

    console.log(`${formattedDate} | Running time loop`);
    controlPower();
}

function controlPower() {
    const now = new Date();
    const currentHour = now.getHours();

    const dayTime = currentHour > 9 && currentHour < 23;

    if(dayTime && PINS.POWER.value === 0) {
        console.log('----------- TURNING POWER ON --------------')
        PINS.POWER.value = 1;
    }

    if(!dayTime && PINS.POWER.value === 1) {
        console.log('----------- TURNING POWER OFF --------------')
        PINS.POWER.value = 0;
    }

    board.digitalWrite(PINS.POWER.pin, PINS.POWER.value);
}


board.on('ready', onReady);
board.on('exit', onExit);
board.on('close', onExit);