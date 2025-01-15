class Config {
    constructor() {
        this.configCache = {};
        this._receiveUpdateConfig();
    }

    async loadConfig(key, subKeys = null) {
        try {
            return await this._getConfig(key, subKeys);
        } catch (error) {
            console.error(`Error loading config for key "${key}":`, error);
        }
    }

    async loadFullConfig(key) {
        const config = await this.loadConfig(key);
        this.configCache[key] = config;
        return this.configCache[key];
    }

    async getConfig(key, subKeys = null) {
        if (this.configCache[key] ) {
            if (subKeys && !this._isSubKeysValid(this.configCache[key], subKeys)) {
                    const config = await this.loadConfig(key, subKeys);
                    this.configCache[key] = { ...this.configCache[key], ...config };
            }
            return this.configCache[key];
        }
        
        const config = await this.loadConfig(key, subKeys);
        this.configCache[key] = subKeys ? { ...config } : config;
    
        return this.configCache[key];
    }

    _isSubKeysValid(config, subKeys) {
        return subKeys.every((subKey) => config[subKey] !== undefined);
    }

    async _getConfig(key, subKeys = null) {
        const response = await this._sendMessageAsync({ action: "data-config", mode: "get-config", key, subKeys });
        if (response && response.config) {
            return response.config;
        }
        return {};
    }

    async setConfig(key, config) {
        await this._sendMessageAsync({ action: "data-config", mode: "save-config", key, config });
        this.configCache[key] = { ...this.configCache[key], ...config };
    }

    _sendMessageAsync(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError));
                } else {
                    resolve(response);
                }
            });
        });
    }

    _receiveUpdateConfig() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === "update-config" && message.key) {
                this.configCache[message.key] = message.config;
                const event = new CustomEvent(`config-updated`, { detail: { key: message.key }});
                window.dispatchEvent(event);
            }
        });
    }
}

const ExtensionConfig = new Config();
ExtensionConfig.loadFullConfig("functionConfig");