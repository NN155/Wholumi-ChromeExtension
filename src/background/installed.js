chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("functionConfig", (data) => {
        let config = data.functionConfig;
        let defaultConfig = {
            autoLootCards: true,
            searchCards: true,
            anotherUserMode: true,
            tradeHelper: true,
            remeltDubles: true,
            clubBoost: true,
        }
        if (config) {
            defaultConfig = { ...defaultConfig, ...config };
        }

        chrome.storage.local.set({ functionConfig: defaultConfig });
        
        chrome.storage.local.get("dataConfig", (data) => {
            let config = data.dataConfig;
            let defaultConfig = {
                lastUpdate: {},
                packInventory : {},
            }
            if (config) {
                defaultConfig = { ...defaultConfig, ...config }; 
            }

            chrome.storage.local.set({ dataConfig: defaultConfig });
        })
    });
});