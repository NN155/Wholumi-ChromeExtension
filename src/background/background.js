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
    }
});



