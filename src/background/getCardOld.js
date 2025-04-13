class TabController {
    constructor() {
        this.tabs = new Set();
        this.newTabs = new Set();
        this.successTab = null;
    }
    addTab(tabId) {
        this.newTabs.add(tabId);
    }
    removeTab(tabId) {
        this.tabs.delete(tabId);
    }
    async tabExists(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (!tab || !isTargetDomain(tab.url)) {
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    async *generateIterator() {
        while (true) {
            if (this.newTabs.size > 0) {
                this.tabs = new Set([...this.newTabs, ...this.tabs]);
                this.newTabs.clear();
            }
            if (this.tabs.size === 0) {
                yield null;
                continue;
            }
            for (const tabId of this.tabs) {
                while (this.successTab) {
                    if (await this.tabExists(this.successTab)) {
                        yield this.successTab;
                    }
                    else {
                        this.successTab = null;
                    }
                }
                const exists = await this.tabExists(tabId);
                if (!exists) {
                    this.removeTab(tabId);
                    continue;
                }

                yield tabId;
            }
        }
    }
}

class TimeController {
    constructor() {
        this.blockSendingUntil = null;
    }
    setBlockSendingUntil() {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(1, 0, 0);
        this.blockSendingUntil = now.getTime();
    }
    isBlocked() {
        return this.blockSendingUntil !== null && this.blockSendingUntil > Date.now();
    }
}

function sendMessageWithTimeout(tabId, timeoutDuration = 5000) {
    return new Promise((resolve) => {
        let timeoutReached = false;

        chrome.tabs.sendMessage(tabId, { action: "get-card", mode: "get-card" }, response => {
            if (!timeoutReached) {
                if (response) {
                    resolve(response);
                } else {
                    resolve(null);
                }
            }
        });


        setTimeout(() => {
            timeoutReached = true;
            resolve(null); 
        }, timeoutDuration);
    });
}

async function pingTab() {
    loggerGetCard("Tabs", tabs);
    while(true) {
        const {value: tabId, done} = await iterator.next();

        if (tabId === null) {
            return { no_tabs: true };
        }
        // Send message to next tab
        const response = await sendMessageWithTimeout(tabId);
        if (response) {
            if (!tabs.successTab) {
                tabs.successTab = tabId;
            }
            return response;
        }
        else {
            tabs.successTab = null;
        }
    }
}

async function processPingTab() {
    if (await config.functionConfig.autoLootCards && !working && !time.isBlocked()) { // Check if we are not already working or blocked
        working = true;
        loggerGetCard("processPingTab: Starting pingTab process");
        while (await config.functionConfig.autoLootCards) {
            const response = await pingTab(); // get response from tab
            loggerGetCard("processPingTab: got response", response);
            if (response?.no_tabs) { // if no tabs are available
                break; // exit loop
            }
            else if (response?.stop_reward === "yes") {
                time.setBlockSendingUntil(); // block sending for 1 hour
                loggerGetCard(`STOP_REWARD: block sending until ${new Date(time.blockSendingUntil).toLocaleTimeString()}`);
                break;
            }

            loggerGetCard("processPingTab: Waiting for 168 seconds");
            await new Promise(resolve => setTimeout(resolve, 168 * 1000)); // wait for 168 seconds
        }
        loggerGetCard("Ending pingTab process");
        working = false; // set working to false
    }
}



const loggerGetCard = createLogger("getCard");

const tabs = new TabController();
const iterator = tabs.generateIterator();
const time = new TimeController();
let working = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse, tab) => {
    if (message.action === "get-card") {
        switch (message.mode) {
            case "ping-tab":
                loggerGetCard("Ping tab request from", sender.tab.id);
                tabs.addTab(sender.tab.id);
                processPingTab(); // Async process

                sendResponse({ status: "success" });
                return true
            default:
                console.error("Unknown mode:", message.mode);
                sendResponse({ success: false, error: "Unknown mode" });
                return true;
        }
    }
});

self.addEventListener("config-updated", (event) => {
    if (event.detail.key === "functionConfig") {
        processPingTab();
    }
});


logger("GetCard.js loaded");