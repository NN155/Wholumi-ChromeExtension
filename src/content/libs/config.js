class Config {
    constructor() {
        this.functionConfig = null; // Кеш для конфігурації
        this.isInitialized = false; // Флаг, щоб уникнути багаторазової ініціалізації
        this.initializationPromise = null; // Черга для обіцянок
        this._receiveUpdateConfig(); // Прослуховування оновлення конфігурації
    }

    async initialization() {
        if (!this.isInitialized) {
            // Якщо конфігурація ще не завантажена, створюємо проміс для ініціалізації
            this.initializationPromise = this.initializationPromise || this.loadConfig();
            await this.initializationPromise; // Чекаємо на завершення завантаження конфігурації
        }
    }

    async loadConfig() {
        try {
            this.functionConfig = await this._getConfig(); // Завантаження конфігурації
            this.isInitialized = true; // Конфігурація завантажена
        } catch (error) {
            console.error("Error loading config:", error);
        }
    }

    async getConfig() {
        await this.initialization(); // Чекаємо на завантаження конфігурації
        return this.functionConfig || {}; // Повертаємо кеш або порожній об'єкт
    }

    async _getConfig() {
        const response = await this._sendMessageAsync({ action: "get-function-config" });
        if (response && response.config) {
            return response.config;
        }
        return {};
    }

    async setConfig(config) {
        await this._sendMessageAsync({ action: "save-function-config", functionConfig: config });
        this.functionConfig = { ...this.functionConfig, ...config };
        console.log(this.functionConfig);
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
            if (message.action === "update-function-config") {
                this.functionConfig = message.functionConfig;
                const event = new CustomEvent("function-config-updated");
                window.dispatchEvent(event);
            }
        }), () => chrome.runtime.sendMessage({ status: "success"});
    }
}

const ExtensionConfig = new Config();
ExtensionConfig.initialization();