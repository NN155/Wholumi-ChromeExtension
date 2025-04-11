function createLogger(name = null) {
    return function(...args) {
        const time = new Date().toLocaleTimeString();
        if (name) {
            console.log(`[${time}] [${name}]`, ...args);
        } else {
            console.log(`[${time}]`, ...args);
        }
    };
}

const logger = createLogger();