const TPLinkMessageClient = require('./tp-link-message-client');
const {
    GET_SYSTEM_INFO,
    generatePowerToggleMessage,
    wrapMessageForChild
} = require('./message-generator');

class PowerStrip {
    constructor(host) {
        this.host = host;
        this.messageClient = new TPLinkMessageClient(host);
    }

    async connect() {
        const response = await this.messageClient.sendMessage(GET_SYSTEM_INFO);
        const systemInfo = response.system.get_sysinfo;

        this.children = systemInfo.children;
    }

    async sendMessageToChild(childId, message) {
        const formattedMessage = wrapMessageForChild(childId, message);
        const response = await this.messageClient.sendMessage(formattedMessage);

        return response;
    }

    async setPowerForPlug(plugNumber, powerOnOrOff) {
        const plugIndex = plugNumber - 1;

        if(!this.children[plugIndex]) throw new Error(`"Plug ${plugNumber}" is not a valid label`);

        const childId = this.children[plugIndex].id;
        const powerMessage = generatePowerToggleMessage(powerOnOrOff);

        return this.sendMessageToChild(childId, powerMessage);
    }

    getPowerStatusForPlug(plugNumber) {
        const plugIndex = plugNumber - 1;

        if(!this.children[plugIndex]) throw new Error(`"Plug ${plugNumber}" is not a valid label`);

        return this.children[plugIndex].state;
    }


}

module.exports = PowerStrip;











// class PowerStripPlug {
//     constructor(id, alias, deviceRef) {
//         this.id = id;
//         this.alias = alias;

//         // Temporary, get rid of this shit with the library
//         this.deviceRef = deviceRef;
//     }

//     async on() {
//         const message = {
//             system: {
//                 set_relay_state: {
//                     state: 1
//                 }
//             }
//         };

//         return this.sendMessage(message);
//     }

//     async off() {
        // const message = {
        //     system: {
        //         set_relay_state: {
        //             state: 0
        //         }
        //     }
        // };

//         return this.sendMessage(message);
//     }

//     async sendMessage(message) {
//         const formattedMessage = {
//             context: {
//                 child_ids: [this.id]
//             },
//             ...message
//         };

//         try {
//             const messageString = JSON.stringify(formattedMessage);
//             console.log("?", messageString)
//             const response = await this.deviceRef.send(messageString);
//             return response;
//         } catch(err) {
//             console.error(err);
//         }

//     }
// }