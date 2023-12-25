function attachExitCallback(callback) {
    if(!callback) throw new Error('No callback provided');

    const exitTypes = [
        'uncaughtException', 'unhandledRejection',
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP',
        'SIGABRT','SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV',
        'SIGUSR2', 'SIGTERM',
    ];

    exitTypes.forEach(evt => process.on(evt, async (evtOrExitCodeOrError) => {
        console.error('Caught exit event', evt)
        console.error(evtOrExitCodeOrError);

        await callback();
        const exitCode = isNaN(+evtOrExitCodeOrError) ? 1 : +evtOrExitCodeOrError;
        process.exit(exitCode);
    }));
};

module.exports = { attachExitCallback };