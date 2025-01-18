class TimeController {
    static setBlockHour() {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(1, 0, 0);
        this.setData({ blockSendingUntil: now.getTime(), isBlocked: true });
    }
    static setBlockMinutes() {
        this.setData({ blockSendingUntil: Date.now() + 1000 * 168, isBlocked: false });
    }

    static setData(data) {
        chrome.storage.local.set({ getCardData: data });
    }

    static getFromStorage(key) {
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

const loggerGetCard = createLogger("getCard");

chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.action === "get-card") {
        switch (message.mode) {
            case "ping-tab":
                (async () => {
                    const data = await TimeController.getFromStorage("getCardData");
                    const functionConfig = await TimeController.getFromStorage("functionConfig");
                    let response;
                    if (!functionConfig.autoLootCards) {
                        response = { stop: "yes" };
                    }
                    else if (data.blockSendingUntil < Date.now()) {
                        TimeController.setBlockMinutes();
                        response = { continue: "yes" };
                    }
                    else if (data.isBlocked) {
                        response = { stop: "yes" };
                    }
                    else {
                        response = { skip: "yes" };
                    }
                    sendResponse(response)
                    loggerGetCard("Ping tab request from", sender.tab.id, response);
                })();
                return true
            case "block-hour":
                TimeController.setBlockHour();
                sendResponse({ success: "yes" });
                return true;
        }
    }
});

logger("GetCard.js loaded");