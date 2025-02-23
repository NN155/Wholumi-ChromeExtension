async function miscTab() {
    const elementsConfig = [
        {config: "functionConfig", html: "Switcher", id: 'autoLoot', label: 'Auto Loot Cards', data: 'autoLootCards', group: 'General'},

        {config: "functionConfig", html: "Switcher", id: 'searchCards', label: 'Search Cards in Need/Trade/Users', data: 'searchCards', group: 'Cards Info'},
        {config: "functionConfig", html: "Switcher", id: 'anotherUserMode', label: 'Search on behalf of another user', data: 'anotherUserMode', containerStyle: 'margin-left: 2rem', group: 'Cards Info'},
        {config: "functionConfig", html: "Switcher", id: 'tradeHelper', label: 'Trade Helper', data: 'tradeHelper', containerStyle: 'margin-left: 2rem', group: 'Cards Info'},
        {config: "functionConfig", html: "Switcher", id: 'graphSearch', label: 'Graph Search', data: 'graphSearch', containerStyle: 'margin-left: 2rem', group: 'Cards Info'},
        {config: "lastUpdate", html: "Button", id: 'cards-data-s-rank', label: 'Update and Build S Graph ', onEvent: { key: "cards-data", event: "update-data-config", rank: "s", saveAs: "cards-data-s-rank" }, group: 'Cards Info', data: "cards-data-s-rank" },

        {config: "functionConfig", html: "Switcher", id: 'remeltDubles', label: 'Show dubles in remelt', data: 'remeltDubles', group: 'Remelt'},

        {config: "functionConfig", html: "Switcher", id: 'clubBoost', label: 'Club Boost', data: 'clubBoost', group: 'Club'},
        {config: "functionConfig", html: "Switcher", id: 'openCards', label: 'Boost Opened Cards Only', data: 'openCards', group: 'Club'},
        {config: "lastUpdate", html: "Button", id: 'openedInventory', label: 'Update opened cards info', onEvent: { key: "openedInventory", event: "update-data-config" }, group: 'Club', data: "openedInventory" },
        {config: "functionConfig", html: "Switcher", id: 'customBoostMode', label: 'Custom Boost Mode', data: 'customBoostMode', group: 'Club'},
        {config: "miscConfig", html: "Input", type:"Number", min: 0, max: 3000, id: 'autoUpdateDelay',label: 'Auto Update Delay (ms)', data: "clubBoost", subkey: "autoUpdateDelay", group: 'Club'},
        {config: "miscConfig", html: "Input", type:"Number", min: 0, max: 1000, id: 'autoBoostDelay', label: 'Auto Boost Delay (ms)', data: "clubBoost", subkey: "autoBoostDelay", group: 'Club'},
        {config: "miscConfig", html: "Input", type:"Number", min: 0, max: 1000, id: 'customBoostTime', label: 'Custom Delay Trigger Time (ms)', data: "clubBoost", subkey: "customBoostTime", group: 'Club'},
        {config: "miscConfig", html: "Input", type:"Number", min: 0, max: 1000, id: 'customBoostDelay', label: 'Custom Boost Delay (ms)', data: "clubBoost", subkey: "customBoostDelay", group: 'Club'},
        { html: "Button", id: 'submitClub', text: 'Save Changes', onclick: () => tab.saveInputData("miscConfig", "clubBoost"), group: 'Club' },
    ];

    const content = Tab.createContent(elementsConfig);

    const tab = new Tab('Misc', content);

    tab.elementsConfig = elementsConfig;
    tab.tabData = [["functionConfig", null], ["miscConfig", ["clubBoost"]], ["lastUpdate", null]];

    return tab;
}