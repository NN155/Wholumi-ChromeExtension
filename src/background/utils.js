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

targetDomains = [
    "https://animestars.org/",
    "https://asstars.tv/",
    "https://as1.astars.club/",
    "https://asstars1.astars.club/",
    "asstars.club/",
]

isTargetDomain = (url) => {
    return targetDomains.some(domain => url.startsWith(domain));
}

const logger = createLogger();