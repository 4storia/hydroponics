const PowerStrip = require('./tp-link/power-strip');

const POWER_STRIP_HOST = '192.168.50.245';
const MAIN_PLANTS_UV_LIGHT_PLUG = 3;
const WATER_PUMP_PLUG = 2;

const FIFTEEN_MINUTES = 1000 * 60 * 15;
const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_SECONDS = 1000 * 30;

async function timeLoop() {
    await controlPower();
}

async function controlPower() {
    const powerStrip = new PowerStrip(POWER_STRIP_HOST);
    await powerStrip.connect();

    manageLights(powerStrip);
    manageWater(powerStrip);
}

function isSunUp() {
    const now = new Date();
    const currentHour = now.getHours();
    const dayTime = currentHour >= 9 && currentHour < 23;

    return dayTime;
}

function manageLights(powerStrip) {
    const now = new Date();
    const currentHour = now.getHours();
    const dayTime = currentHour >= 9 && currentHour < 23;

    const formattedDate = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US')}`;

    // Main UV Light
    if(dayTime && powerStrip.getPowerStatusForPlug(MAIN_PLANTS_UV_LIGHT_PLUG) === 0) {
        console.log(`[ ${formattedDate} ]: ON - Main UV lighting`);
        powerStrip.setPowerForPlug(MAIN_PLANTS_UV_LIGHT_PLUG, 1)
    } else if(!dayTime && powerStrip.getPowerStatusForPlug(MAIN_PLANTS_UV_LIGHT_PLUG) === 1) {
        console.log(`[ ${formattedDate} ]: OFF - Main UV lighting`);
        powerStrip.setPowerForPlug(MAIN_PLANTS_UV_LIGHT_PLUG, 0)
    }
}

function manageWater(powerStrip) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const formattedDate = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US')}`;

    const isWaterAlreadyOn = powerStrip.getPowerStatusForPlug(WATER_PUMP_PLUG) === 1;
    const shouldTurnOnWater = !isWaterAlreadyOn && isSunUp();

    if(shouldTurnOnWater) {
        console.log(`[ ${formattedDate} ]: ON - Water pump`);
        powerStrip.setPowerForPlug(WATER_PUMP_PLUG, 1);
        setTimeout(() => {
            console.log(`[ ${formattedDate} ]: OFF - Water pump`);
            powerStrip.setPowerForPlug(WATER_PUMP_PLUG, 0);
        }, THIRTY_SECONDS);
    } else {
        console.log(`[ ${formattedDate} ]: OFF - Water pump`);
        powerStrip.setPowerForPlug(WATER_PUMP_PLUG, 0)
    }
}

async function orchestrate() {
    await timeLoop();
    const runningInterval = setInterval(timeLoop, FIFTEEN_MINUTES);
}

orchestrate();