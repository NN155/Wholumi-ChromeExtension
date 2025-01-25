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
            customBoostMode: false,
        }
        if (config) {
            defaultConfig = { ...defaultConfig, ...config };
        }
        chrome.storage.local.set({ functionConfig: defaultConfig });
    });

    chrome.storage.local.get("dataConfig", (data) => {
        let config = data.dataConfig;
        let defaultConfig = {
            lastUpdate: {},
            packInventory: {},
        }
        if (config) {
            defaultConfig = { ...defaultConfig, ...config };
        }

        chrome.storage.local.set({ dataConfig: defaultConfig });
    })

    let defaultConfig = {
        blockSendingUntil: Date.now(),
        isBlocked: false,
    }
    chrome.storage.local.set({ getCardData: defaultConfig });

    chrome.storage.local.get("miscConfig", (data) => {
        let config = data.miscConfig;
        let defaultConfig = {
            clubBoost: {
                autoUpdateDelay: 250,
                autoBoostDelay: 75,
                customBoostTime: 700,
                customBoostDelay: 25,
            },
            packs: {
                balance: 10000,
                counter: 20,
                sChance: 1,
                aChance: 1,
                bChance: 1,
                cChance: 1,
                dChance: 1,
                eChance: 1,
            },
        }
        if (config) {
            defaultConfig = { 
                clubBoost: { ...defaultConfig.clubBoost, ...config.clubBoost },
                packs: { ...defaultConfig.packs, ...config.packs },
             };
        }
        chrome.storage.local.set({ miscConfig: defaultConfig });
    });

});