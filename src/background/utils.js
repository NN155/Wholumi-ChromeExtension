const TargetDomain = "https://animestars.org";
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

class Config {
    constructor() {
        this.functionConfig = null;
    }

    async initialization() {
        this.functionConfig = await this.getFromStorage("functionConfig");
    }

    getFromStorage(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, (data) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError));
                } else {
                    resolve(data[key]);
                }
            });
        });
    }
}

const config = new Config();
config.initialization();

self.addEventListener("config-updated", async () => {
    await config.initialization();
    const event = new CustomEvent("function-config-updated");
    self.dispatchEvent(event);
});
