async function miscTab(menu) {

    const config = [
        {id: 'autoLoot', label: 'Auto Loot Cards', data: 'autoLootCards', group: 'General'},
        {id: 'searchCards', label: 'Search Cards in Need/Trade/Users', data: 'searchCards', group: 'Cards Info'},
        {id: 'anotherUserMode', label: 'Search on behalf of another user', data: 'anotherUserMode', containerStyle: 'margin-left: 2rem', group: 'Cards Info'},
        {id: 'tradeHelper', label: 'Trade Helper', data: 'tradeHelper', containerStyle: 'margin-left: 2rem', group: 'Cards Info'},
        {id: 'remeltDubles', label: 'Show dubles in remelt', data: 'remeltDubles', group: 'Remelt'},
        {id: 'clubBoost', label: 'Club Boost', data: 'clubBoost', group: 'Club'},
    ];

    let content = "";
    const groups = {};

    config.forEach((item) => {
        if (!groups[item.group]) {
            groups[item.group] = [];
        }
        groups[item.group].push(item);
    });

    const groupKeys = Object.keys(groups);
    
    groupKeys.forEach((group, index) => {
        content += `<div class="group-title">${group}</div>`;
        
        groups[group].forEach((item) => {
            content += `
                <div id="${item.id}Switcher"></div>
            `;
        });

        // Додаємо роздільник, якщо це не остання група
        if (index !== groupKeys.length - 1) {
            content += '<hr>';
        }
    });

    const tab = new Tab('Misc', content);

    tab.config = config;

    await tab.updateConfig();

    tab.onConfigUpdate = async () => {
        await tab.updateConfig();
        tab.config.forEach((item) => {
            item.switcher.updateState(tab.functionConfig[item.data]);
        });
    };
    tab.createSwitcher = (item) => {
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        item.container = shadowRoot.querySelector(`#${item.id}Switcher`);

        if (item.containerStyle) {
            item.container.style = item.containerStyle;
        }

        item.switcher = new CustomMenuSwitcher({
            id: item.id,
            label: item.label,
            checked: tab.functionConfig[item.data],
            onChange: async (isChecked) => {
                await tab.setConfig({ [item.data]: isChecked });
            }
        });
        item.switcher.render(item.container);
    }

    tab.onActivate = async() => {
        tab.config.forEach((item) => {
            tab.createSwitcher(item);
        });

        window.removeEventListener("function-config-updated", tab.onConfigUpdate);
        window.addEventListener("function-config-updated", tab.onConfigUpdate);
    };

    return tab;
}
