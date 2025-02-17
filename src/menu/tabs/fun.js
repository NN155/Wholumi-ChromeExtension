async function funTab() {
    const elementsConfig = [
        { config: "lastUpdate", html: "Button", id: 'packInventory', label: 'Update inventory info', onEvent: { key: "packInventory", event: "update-data-config" },  group: 'Packs', data: "packInventory" },
        { config: "lastUpdate", html: "Button", id: 'siteInventory', label: 'Update site cards info', onEvent: { key: "siteInventory", event: "update-data-config" },  group: 'Packs', data: "siteInventory" },
        { html: "Input", id: 'packBalance',  label: 'Balance', type:"Number", min: 0, config: "miscConfig", data: "packs", subkey: "balance", group: 'Packs' },
        { html: "Input", id: 'packCounter', type:"Number", min: 1, max: 39, label: 'Counter', config: "miscConfig", data: "packs", subkey: "counter", group: 'Packs' },
        { html: "Input", id: 'packS', type:"Number", min: 0, max: 10000, label: 'S chance', config: "miscConfig", data: "packs", subkey: "sChance", group: 'Packs' },
        { html: "Input", id: 'packA', type:"Number", min: 0, max: 10000, label: 'A chance', config: "miscConfig", data: "packs", subkey: "aChance", group: 'Packs' },
        { html: "Input", id: 'packB', type:"Number", min: 0, max: 10000, label: 'B chance', config: "miscConfig", data: "packs", subkey: "bChance", group: 'Packs' },
        { html: "Input", id: 'packC', type:"Number", min: 0, max: 10000, label: 'C chance', config: "miscConfig", data: "packs", subkey: "cChance", group: 'Packs' },
        { html: "Input", id: 'packD', type:"Number", min: 0, max: 10000, label: 'D chance', config: "miscConfig", data: "packs", subkey: "dChance", group: 'Packs' },
        { html: "Input", id: 'packE', type:"Number", min: 0, max: 10000, label: 'E chance', config: "miscConfig", data: "packs", subkey: "eChance", group: 'Packs' },
        { html: "Button", id: 'injectPack', text: 'Inject', onEvent: { key: "inject", event: "packs" }, onclick: () => tab.saveInputData("miscConfig", "packs"), group: 'Packs' },
    ];

    const content = Tab.createContent(elementsConfig);

    const tab = new Tab('Fun', content);

    tab.elementsConfig = elementsConfig;

    tab.tabData = [["lastUpdate", null], ["miscConfig", ["packs"]]];
    return tab;
}