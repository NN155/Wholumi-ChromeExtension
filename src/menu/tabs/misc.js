async function miscTab() {
    const elementsConfig = [
        {config: "functionConfig", html: "Switcher", id: 'autoLoot', label: 'Auto Loot Cards', data: 'autoLootCards', group: 'General'},
        {config: "functionConfig", html: "Switcher", id: 'searchCards', label: 'Search Cards in Need/Trade/Users', data: 'searchCards', group: 'Cards Info'},
        {config: "functionConfig", html: "Switcher", id: 'anotherUserMode', label: 'Search on behalf of another user', data: 'anotherUserMode', containerStyle: 'margin-left: 2rem', group: 'Cards Info'},
        {config: "functionConfig", html: "Switcher", id: 'tradeHelper', label: 'Trade Helper', data: 'tradeHelper', containerStyle: 'margin-left: 2rem', group: 'Cards Info'},
        {config: "functionConfig", html: "Switcher", id: 'remeltDubles', label: 'Show dubles in remelt', data: 'remeltDubles', group: 'Remelt'},
        {config: "functionConfig", html: "Switcher", id: 'clubBoost', label: 'Club Boost', data: 'clubBoost', group: 'Club'},
    ];

    const content = Tab.createContent(elementsConfig);

    const tab = new Tab('Misc', content);

    tab.elementsConfig = elementsConfig;
    tab.tabData = ["functionConfig"]
    await tab.updateConfig("functionConfig");

    return tab;
}