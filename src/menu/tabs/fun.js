async function funTab() {
    const elementsConfig = [
        { config: "dataConfig", html: "Button", id: 'packInventory', label: 'Update inventory info', onEvent: { key: "packInventory", event: "update-data-config" }, group: 'Packs', data: "lastUpdate", subkey: "packInventory" },
        { config: "dataConfig", html: "Button", id: 'siteInventory', label: 'Update site cards info', onEvent: { key: "siteInventory", event: "update-data-config" }, group: 'Packs', data: "lastUpdate", subkey: "siteInventory" },
        { html: "Input", id: 'packBalance', value: "10000", label: 'Balance', group: 'Packs' },
        { html: "Input", id: 'packCounter', value: "20", label: 'Counter', group: 'Packs' },
        { html: "Input", id: 'packS', value: "1", label: 'S chance', group: 'Packs' },
        { html: "Input", id: 'packA', value: "1", label: 'A chance', group: 'Packs' },
        { html: "Input", id: 'packB', value: "1", label: 'B chance', group: 'Packs' },
        { html: "Input", id: 'packC', value: "1", label: 'C chance', group: 'Packs' },
        { html: "Input", id: 'packD', value: "1", label: 'D chance', group: 'Packs' },
        { html: "Input", id: 'packE', value: "1", label: 'E chance', group: 'Packs' },
        { html: "Button", id: 'injectPack', text: 'Inject', onEvent: { key: "inject", event: "packs" }, onclick: () => getPackData(), group: 'Packs' },
    ];
    function getPackData() {
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        return {
            info: {
                balance: verifyValue('#packBalance', 10000),
                counter: verifyValue('#packCounter', 20),
            },
            chances: [
                { rank: "s", chance: verifyValue('#packS', 1) },
                { rank: "a", chance: verifyValue('#packA', 1) },
                { rank: "b", chance: verifyValue('#packB', 1) },
                { rank: "c", chance: verifyValue('#packC', 1) },
                { rank: "d", chance: verifyValue('#packD', 1) },
                { rank: "e", chance: verifyValue('#packE', 1) },
            ]
        };
    }

    function verifyValue(querySelector, defaultVal) {
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        const value = shadowRoot.querySelector(querySelector).value;
        if (!isNaN(value) && Number(value) >= 0) {
            return Number(value);
        }
        return defaultVal;
    }
    const content = Tab.createContent(elementsConfig);

    const tab = new Tab('Fun', content);

    tab.elementsConfig = elementsConfig;

    tab.tabData = ["dataConfig"];
    await tab.updateConfig("dataConfig", ["lastUpdate"]);

    return tab;
}