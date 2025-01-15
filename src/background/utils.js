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

self.addEventListener("config-update", async (e) => {
    if (event.detail.key === "functionConfig") {
        await config.initialization();
    }
    const event = new CustomEvent("config-updated", { detail: { key: e.detail.key } });
    self.dispatchEvent(event);
});
