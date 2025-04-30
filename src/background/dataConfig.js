chrome.runtime.onMessage.addListener((message, sender, sendResponse, tab) => {
    if (message.action === "data-config") {
        switch (message.mode) {
            case "get-config":
                switch (message.key) {
                    case "userConfig":
                        chrome.storage.local.get(message.key, (data) => {
                            const { username, password, sk } = data[message.key];
                            const decryptedPassword = CryptoJS.AES.decrypt(password, sk).toString(CryptoJS.enc.Utf8);
                            const config = {
                                username,
                                password: decryptedPassword,
                            };
                            sendResponse({ config });
                        });
                        return true;
                    default:
                        chrome.storage.local.get(message.key, (data) => {
                            data[message.key] = filterKeys(data[message.key], message.subKeys);
                            sendResponse({ config: data[message.key] });
                        });
                        return true;
                }

            case "save-config":
                switch (message.key) {
                    case "functionConfig":
                        chrome.storage.local.get(message.key, (data) => {
                            let config = data[message.key];
                            config = { ...config, ...message.config };
                            sendResponse({ config: config });
                            chrome.storage.local.set({ [message.key]: config }, (data) => {
                                const event = new CustomEvent("config-update", { detail: { key: message.key } });
                                self.dispatchEvent(event);
                                notifyTabsAboutConfig({ key: message.key, config, senderTabId: sender.tab.id });
                            });
                        });
                        return true;
                    case "dataConfig":
                        chrome.storage.local.get(message.key, (data) => {
                            let config = data[message.key];
                            const messageConfig = message.config;
                            config = { ...config, ...message.config };
                            sendResponse({ config: config });
                            chrome.storage.local.set({ [message.key]: config });

                            chrome.storage.local.get("lastUpdate", (data) => {
                                const lastUpdate = data.lastUpdate;
                                for (const key in messageConfig) {
                                    lastUpdate[key] = new Date().toLocaleString();
                                }
                                chrome.storage.local.set({ lastUpdate: lastUpdate }, (data) => {
                                    notifyTabsAboutConfig({ key: "lastUpdate", config: lastUpdate });
                                });
                            });

                        });
                        return true;
                    case "miscConfig":
                        chrome.storage.local.get(message.key, (data) => {
                            let config = data[message.key];
                            config = { ...config, ...message.config };
                            sendResponse({ config: config });
                            chrome.storage.local.set({ [message.key]: config }, (data) => {
                                notifyTabsAboutConfig({ key: message.key, config });
                            });
                        });
                        return true;

                    case "userConfig":
                        const { username, password } = message.config.userConfig;
                        const secretKey = generateSecretKey(1024);
                        const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

                        const config = {
                            username,
                            password: encryptedPassword,
                            sk: secretKey,
                        };
                        chrome.storage.local.set({ [message.key]: config });
                        chrome.storage.local.get("miscConfig", (data) => {
                            let miscConfig = data.miscConfig;
                            miscConfig = {
                                ...miscConfig, userConfig: {
                                    username,
                                    password: '*'.repeat(password.length),
                                }
                            };
                            sendResponse({ config: miscConfig });
                            chrome.storage.local.set({ miscConfig: miscConfig }, (data) => {
                                notifyTabsAboutConfig({ key: "miscConfig", config: miscConfig });
                            });
                        });
                        return true;
                }
        }
    }
});


function notifyTabsAboutConfig({ key, config, senderTabId = null, info = null }) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            const url = tab.url || "";
            console.log(url, isTargetDomain(url), senderTabId, tab.id);
            if (isTargetDomain(url)) {
                chrome.tabs.sendMessage(tab.id, { action: "update-config", key, info, config, tabSender: !(senderTabId === null || tab.id !== senderTabId) });
            }
        });
    });
}

function filterKeys(config, subKeys) {
    if (!subKeys) {
        return config;
    }
    const filteredConfig = {};
    subKeys.forEach(subkey => {
        if (config[subkey] !== undefined) {
            filteredConfig[subkey] = config[subkey];
        }
    });
    return filteredConfig;
}

function generateSecretKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        result += chars.charAt(randomValues[i] % chars.length);
    }

    return result;
}