const PowerStrip = require('./tp-link/power-strip');
const Filestore = require('./filestore-db');
const { attachExitCallback } = require('./utils/node-consistent-exit');

const POWER_STRIP_HOST = '192.168.50.254';
const WATER_PUMP_PLUG = 2;
const UV_LIGHT_PLUG = 3;

const FIFTEEN_MINUTES = 1000 * 60 * 15;
const FIVE_MINUTES = 1000 * 60 * 5;
const FOURTY_FIVE_SECONDS = 1000 * 45;

let HAS_ATTACHED_EXIT_CALLBACK = false;

async function timeLoop() {
    await controlPower();
}

async function controlPower() {
    const powerStrip = new PowerStrip(POWER_STRIP_HOST);
    const filestoredb = new Filestore();
    powerStrip.connectFilestore(filestoredb);

    await powerStrip.connect();

    manageLights(powerStrip);
    manageWater(powerStrip);

    if(HAS_ATTACHED_EXIT_CALLBACK) {
        return;
    }

    attachExitCallback(async () => {
        await emergencyShutdown(powerStrip);
    });

    HAS_ATTACHED_EXIT_CALLBACK = true;
}

function getTimeOfDayHelpers() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const formattedDate = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US')}`;

    const isSunUp = currentHour >= 9 && currentHour < 23;

    return { now, currentHour, currentMinutes, formattedDate, isSunUp };
}

function manageLights(powerStrip) {
    const { isSunUp, formattedDate } = getTimeOfDayHelpers();

    // Main UV Light
    if(isSunUp && powerStrip.getPowerStatusForPlug(UV_LIGHT_PLUG) === 0) {
        console.log(`[ ${formattedDate} ]: ON - Main UV lighting`);
        powerStrip.setPowerForPlug(UV_LIGHT_PLUG, 1)
    } else if(!isSunUp && powerStrip.getPowerStatusForPlug(UV_LIGHT_PLUG) === 1) {
        console.log(`[ ${formattedDate} ]: OFF - Main UV lighting`);
        powerStrip.setPowerForPlug(UV_LIGHT_PLUG, 0)
    }
}

function manageWater(powerStrip) {
    const { isSunUp, formattedDate } = getTimeOfDayHelpers();

    const isWaterAlreadyOn = powerStrip.getPowerStatusForPlug(WATER_PUMP_PLUG) === 1;
    const shouldTurnOnWater = !isWaterAlreadyOn && isSunUp;

    if(shouldTurnOnWater) {
        console.log(`[ ${formattedDate} ]: ON - Water pump`);
        powerStrip.setPowerForPlug(WATER_PUMP_PLUG, 1);
        setTimeout(() => {
            const { formattedDate } = getTimeOfDayHelpers();
            console.log(`[ ${formattedDate} ]: OFF - Water pump`);
            powerStrip.setPowerForPlug(WATER_PUMP_PLUG, 0);
        }, FOURTY_FIVE_SECONDS);
    } else {
        console.log(`[ ${formattedDate} ]: OFF - Water pump`);
        powerStrip.setPowerForPlug(WATER_PUMP_PLUG, 0)
    }
}

async function emergencyShutdown(powerStrip) {
    const { formattedDate } = getTimeOfDayHelpers();
    console.log(`[ ${formattedDate} ]: EMERGENCY SHUTDOWN, Water OFF`);

    await powerStrip.setPowerForPlug(WATER_PUMP_PLUG, 0);
}

async function orchestrate() {
    await timeLoop();
    const runningInterval = setInterval(timeLoop, FIFTEEN_MINUTES);
}

orchestrate();