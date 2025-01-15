chrome.runtime.onMessage.addListener((message, sender, sendResponse, tab) => {
    if (message.action === "data-config") {
        switch (message.mode) {
            case "lastUpdate":
                chrome.storage.local.get("dataConfig", (result) => {
                    const dataConfig = result.dataConfig || {};
                    const updates = {};

                    for (const key in dataConfig) {
                        if (dataConfig[key]?.lastUpdate) {
                            updates[key] = dataConfig[key].lastUpdate;
                        }
                    }

                    sendResponse({ updates });
                });

                return true;
            case "get-config":
                switch (message.key) {
                    case "functionConfig":
                        chrome.storage.local.get("functionConfig", (data) => {
                            data.functionConfig = filterKeys(data.functionConfig, message.subKeys);
                            sendResponse({ config: data.functionConfig });
                        });
                        return true;
                    case "dataConfig": 
                        chrome.storage.local.get("dataConfig", (data) => {
                            data.dataConfig = filterKeys(data.dataConfig, message.subKeys);
                            sendResponse({ config: data.dataConfig });
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
                                notifyTabsAboutConfig(message.key, config, sender.tab.id);
                            });
                        });
                        return true;
                    case "dataConfig":
                        chrome.storage.local.get(message.key, (data) => {
                            let config = data[message.key];
                            const messageConfig = message.config;

                            for (const key in messageConfig) {
                                config.lastUpdate[key] = new Date().toLocaleString();
                            }

                            config = { ...config, ...message.config };
                            sendResponse({ config: config });
                            chrome.storage.local.set({ [message.key]: config }, (data) => {
                                notifyTabsAboutConfig(message.key, { lastUpdate: config.lastUpdate } );
                            });
                        });
                        return true;
                }
        }
    }
});


function notifyTabsAboutConfig(key, config, senderTabId=null) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            const url = tab.url || "";
            if (url.startsWith(TargetDomain) && (senderTabId === null || tab.id !== senderTabId)) {
                chrome.tabs.sendMessage(tab.id, { action: "update-config", key, config });
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