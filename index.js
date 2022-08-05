const PowerStrip = require('./tp-link/power-strip');

const POWER_STRIP_HOST = '192.168.50.245';
const UV_LIGHTING_PLUG = 1;

const FIFTEEN_MINUTES = 1000 * 60 * 15;

async function timeLoop() {
    await controlPower();
}

async function controlPower() {
    const powerStrip = new PowerStrip(POWER_STRIP_HOST);
    await powerStrip.connect();

    const now = new Date();
    const currentHour = now.getHours();
    const dayTime = currentHour >= 9 && currentHour < 23;

    const formattedDate = `${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US')}`;

    if(dayTime && powerStrip.getPowerStatusForPlug(UV_LIGHTING_PLUG) === 0) {
        console.log(`[ ${formattedDate} ]: Turning UV Lighting ON`);
        powerStrip.setPowerForPlug(UV_LIGHTING_PLUG, 1)
    }

    if(!dayTime && powerStrip.getPowerStatusForPlug(UV_LIGHTING_PLUG) === 1) {
        console.log(`[ ${formattedDate} ]: Turning UV Lighting OFF`);
        powerStrip.setPowerForPlug(UV_LIGHTING_PLUG, 0)
    }
}

async function orchestrate() {
    await timeLoop();
    const runningInterval = setInterval(timeLoop, FIFTEEN_MINUTES);
}

orchestrate();