const GET_SYSTEM_INFO = {
    "system": {
        "get_sysinfo": {}
    }
};

function wrapMessageForChild(childId, message) {
    return {
        context: {
            // Despite how this looks, you can only send a message to a single child. No idea why
            child_ids: [childId]
        },
        ...message
    };
}

function generatePowerToggleMessage(onOrOff) {
    return {
        system: {
            set_relay_state: {
                state: !!onOrOff ? 1 : 0
            }
        }
    };
}

module.exports = {
    GET_SYSTEM_INFO,
    wrapMessageForChild,
    generatePowerToggleMessage
}