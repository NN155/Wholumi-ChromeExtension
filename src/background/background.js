chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "get-window-position":
            chrome.storage.local.get("windowPosition", (data) => {
                sendResponse({ position: data.windowPosition });
            });
            return true;
        case "save-window-position":
            chrome.storage.local.set({ windowPosition: message.position });
            functionConfig = chrome.storage.local.get("functionConfig");
            return true;
        case "get-function-config":
            chrome.storage.local.get("functionConfig", (data) => {
                sendResponse({ config: data.functionConfig });
            });
            return true;
        case "save-function-config":
            chrome.storage.local.get("functionConfig", (data) => {
                let functionConfig = data.functionConfig;
                functionConfig = { ...functionConfig, ...message.functionConfig };
                sendResponse({ config: functionConfig });
                chrome.storage.local.set({ functionConfig }, (data) => {
                    const event = new CustomEvent("config-updated");
                    self.dispatchEvent(event);
                    notifyTabsAboutConfig(functionConfig, sender.tab.id);
                });
            });
            return true;
    }
});

function notifyTabsAboutConfig(functionConfig, senderTabId) {
    
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            const url = tab.url || "";
            if (url.startsWith(TargetDomain) && tab.id !== senderTabId) {
                chrome.tabs.sendMessage(tab.id, { action: "update-function-config", functionConfig });
            }
        });
    });
}

