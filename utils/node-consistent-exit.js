function attachExitCallback(callback) {
    if(!callback) throw new Error('No callback provided');

    [
        'beforeExit', 'uncaughtException', 'unhandledRejection',
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP',
        'SIGABRT','SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV',
        'SIGUSR2', 'SIGTERM',
    ].forEach(evt => process.on(evt, async (evtOrExitCodeOrError) => {
        await callback();
        const exitCode = isNaN(+evtOrExitCodeOrError) ? 1 : +evtOrExitCodeOrError;
        process.exit(exitCode);
    }));
};

module.exports = { attachExitCallback };