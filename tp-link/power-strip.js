const TPLinkMessageClient = require('./tp-link-message-client');
const {
    GET_SYSTEM_INFO,
    generatePowerToggleMessage,
    wrapMessageForChild
} = require('./message-generator');

const DEBUG_MODE = !!process.env.DEBUG_MODE;

class PowerStrip {
    constructor(host) {
        this.host = host;
        this.messageClient = new TPLinkMessageClient(host);
        this.plugNames = {};
        this.db = null;
    }

    setPlugName (plugNumber, name) {
        this.plugNames[plugNumber] = name;
    }

    connectFilestore (filestoreInstance) {
        this.db = filestoreInstance;
    }

    async connect() {
        const response = await this.messageClient.sendMessage(GET_SYSTEM_INFO);
        const systemInfo = response.system.get_sysinfo;

        this.children = systemInfo.children;
    }

    async sendMessageToChild(childId, message) {
        const formattedMessage = wrapMessageForChild(childId, message);

        if(!DEBUG_MODE) {
            const response = await this.messageClient.sendMessage(formattedMessage);

            return response;
        } else {
            console.log('[DEBUG]', formattedMessage);
        }
    }

    async setPowerForPlug(plugNumber, powerOnOrOff) {
        const plugIndex = plugNumber - 1;

        if(!this.children[plugIndex]) throw new Error(`"Plug ${plugNumber}" is not a valid label`);

        const childId = this.children[plugIndex].id;
        const powerMessage = generatePowerToggleMessage(powerOnOrOff);

        this.recordStateChange(plugNumber, 'POWER', powerOnOrOff);

        return this.sendMessageToChild(childId, powerMessage);
    }

    getPowerStatusForPlug(plugNumber) {
        const plugIndex = plugNumber - 1;

        if(!this.children[plugIndex]) throw new Error(`"Plug ${plugNumber}" is not a valid label`);

        return this.children[plugIndex].state;
    }

    recordStateChange(plugNumber, changeType, value) {
        if(!this.db) return;

        this.db.write(`lastInstructions.${plugNumber}.${changeType}`, value);
    }
}

module.exports = PowerStrip;
