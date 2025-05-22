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
            openCards: false,
            graphSearch: false,
            serverBoost: false,
            decksProgress: true,
            decksProgressDeep: false,
            deckBuilder: true,
            offersResolver: false,
            propose: true,
            autoLogin: false,
        }
        if (config) {
            defaultConfig = { ...defaultConfig, ...config };
        }
        chrome.storage.local.set({ functionConfig: defaultConfig });
    });

    const configKeys = ["packInventory", "siteInventory", "openedInventory", "cards-data-s-rank"];

    updateConfig("dataConfig", {}, configKeys);
    updateConfig("lastUpdate", {}, configKeys);

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
                multiply: 1,
            },
            packs: {
                balance: 10000,
                counter: 20,
                garantS: 500,
                cooldown: 2000,
                assChance: 1,
                sChance: 1,
                aChance: 1,
                bChance: 1,
                cChance: 1,
                dChance: 1,
                eChance: 1,
                card1: "588",
                card2: "1545",
                card3: "19985",
                card4: "20182",
                card5: "16968",
                card6: "861",
                card7: "70",
                card8: "289",
                card9: "7195",
            },
            menuColors: {
                mainColor: "#8a1ec9",
                bgColor: "#34495e",
                secondBgColor: "#2c3e50",
                thirdBgColor: "#2c3e50",
                textColor: "#ecf0f1",
                secondaryTextColor: "#ecf0f1",
                thirdTextColor: "#000000",
            },
            userConfig: {
                username: "",
                password: "",
            },  
        }
        if (config) {
            for (const key in defaultConfig) {
                if (config[key]) {
                    defaultConfig[key] = { ...defaultConfig[key], ...config[key] };
                }
            }
        }
        chrome.storage.local.set({ miscConfig: defaultConfig });
    });

});

const updateConfig = (key, defaultValue, configKeys) => {
    chrome.storage.local.get(key, (data) => {
        if (!data[key]) {
            chrome.storage.local.set({ [key]: defaultValue });
        } else {
            const config = {};
            for (const configKey of configKeys) {
                if (data[key][configKey]) {
                    config[configKey] = data[key][configKey];
                }
            }
            chrome.storage.local.set({ [key]: config });
        }
    });
};