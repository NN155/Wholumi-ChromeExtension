async function globalTab() {
    const elementsConfig = [
        { html: "Switcher", id: 'autoLogin', label: 'Auto Login', config: "functionConfig", data: "autoLogin", group: 'User' },
        { html: "Input", id: 'username', type:"text", label: 'Username', config: "miscConfig", data: "userConfig", subkey: "username", group: 'User' },
        { html: "Input", id: 'password', type:"password", label: 'Password', config: "miscConfig", data: "userConfig", subkey: "password", group: 'User' },
        { html: "Button", id: 'saveUser', text: 'Save', onEvent: { key: "inject", event: "packs" }, onclick: () => tab.saveInputData("userConfig", "userConfig"), group: 'User' },
    ];

    const content = Tab.createContent(elementsConfig);

    const tab = new Tab('Global', content);

    tab.elementsConfig = elementsConfig;
    tab.tabData = [["functionConfig", null],["miscConfig", ["userConfig"]]];

    return tab;
}
