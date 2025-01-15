let updateInventoryPromise = null;

async function funTab() {

    async function updateInventoryInfo() {
        const event = new CustomEvent("update-data-config", {
            detail: {
                key: "packInventory",
            },
        });
        window.dispatchEvent(event);
        await new Promise(resolve=> updateInventoryPromise = resolve);
    }
    window.addEventListener("data-config-updated", async (event) => {
        const cards = [...event.detail.cards];
        tab.setConfig("dataConfig", {packInventory: cards});
        updateInventoryPromise()
    });

    const elementsConfig = [
        {config: "dataConfig", html: "Button", id: 'pack', label: 'Update inventory info', onclick: updateInventoryInfo, group: 'Packs', data: "lastUpdate", subkey: "packInventory"},
    ];

    const content = Tab.createContent(elementsConfig);

    const tab = new Tab('Fun', content);

    tab.elementsConfig = elementsConfig;

    tab.tabData = ["dataConfig"];
    await tab.updateConfig("dataConfig", "lastUpdate");

    return tab;
}