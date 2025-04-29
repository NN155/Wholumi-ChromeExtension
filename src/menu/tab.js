class Tab {
    constructor(tabName, content) {
        this.tabName = tabName;
        this.content = content;
        this.isActive = false;
        this.config = {};
        this.isRendered = false;
    }

    render() {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${this.isActive ? 'active' : ''}`;
        tabElement.textContent = this.tabName;

        tabElement.addEventListener('click', () => {
            this.toggleActive();
        });

        return tabElement;
    }

    toggleActive() {
        this.isActive = !this.isActive;
        this.updateTabState();
    }

    updateTabState() {
        const tabElements = document.querySelectorAll('.tab');
        tabElements.forEach(tab => tab.classList.remove('active'));

        const contentElements = document.querySelectorAll('.window-content');
        contentElements.forEach(content => content.style.display = 'none');
    }

    renderContent() {
        const contentElement = document.createElement('div');
        contentElement.className = 'window-content';
        contentElement.setAttribute('data-tab', this.tabName);
        contentElement.innerHTML = this.content;
        return contentElement;
    }

    async updateConfig(key, subKeys = null) {
        this.config[key] = await ExtensionConfig.getConfig(key, subKeys);
    }

    isTabData(key) {
        if (!this.tabData) { return true }
        for (let i = 0; i < this.tabData.length; i++) {
            const [tabKey, subkeys] = this.tabData[i];
            if (tabKey === key) {
                return true;
            }
        }
        return false;
    }
    async onConfigUpdate(event) {
        if (event.detail.tabSender) return;
        const { key } = event.detail;
        if (!this.isTabData(key)) return;
        await this.updateConfig(key);
        this.elementsConfig.forEach((item) => {
            if (item.config === key) {
                item.element.updateState(this.config[key][item.data]);
            }
        });
    };

    async setConfig(key, config) {
        await ExtensionConfig.setConfig(key, config);
        this.config[key] = await ExtensionConfig.getConfig(key);
    }

    createElement(item) {
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        item.container = shadowRoot.querySelector(`#${item.id}${item.html}`);

        if (item.containerStyle) {
            item.container.style = item.containerStyle;
        }
        const tab = this;
        switch (item.html) {
            case 'Switcher':
                item.element = new CustomMenuSwitcher({
                    id: item.id,
                    label: item.label,
                    checked: tab.config[item.config][item.data],
                    onChange: async (isChecked) => {
                        await tab.setConfig(item.config, { [item.data]: isChecked });
                    }
                });
                break;
            case 'Button':
                item.element = new CustomMenuButton({
                    text: item.text ? item.text : (tab.config[item.config][item.data] || "Not updated"),
                    ...item,
                });
                break;
            case 'Input':
                item.element = new CustomMenuInput({
                    placeHolder: item.placeHolder ? item.placeHolder : (tab.config[item.config][item.data][item.subkey]),
                    ...item,
                });
                break;
            case 'Color':
                item.element = new CustomMenuColor({
                    ...item,
                });
                break;
        }

        item.element.render(item.container);
    }


    async saveInputData(key, data) {
        const config = this.getInputData(data);
        await this.setConfig(key, config);
    }

    getInputData(data) {
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        const config = { [data]: {} };
        this.elementsConfig.forEach((item) => {
            if (item.html === "Input" && item.data === data) {
                const element = shadowRoot.querySelector(`#${item.id}`);

                let value = element.value;
                let placeHolder = element.placeholder;


                if (item.type === "Number") {
                    config[data][item.subkey] = this.verifyValue(value, placeHolder, item.min, item.max);
                    return;
                }

                config[data][item.subkey] = value || placeHolder;
            }
        });
        return config;
    }

    verifyValue(value, defaultVal, min = null, max = null) {
        if (value !== "" && !isNaN(value)) {
            let num = Number(value);
            num = min !== null ? Math.max(num, min) : num;
            num = max !== null ? Math.min(num, max) : num;
            return num;
        }
        return Number(defaultVal);
    }

    async updatedConfigKeys() {
        await Promise.all(this.tabData.map(([key, subkyes]) => {
            return this.updateConfig(key, subkyes);
        }));
    }

    async onActivate() {
        if (this.isRendered) return;
        this.isRendered = true;
        await this.updatedConfigKeys();
        this.elementsConfig.forEach((item) => {
            this.createElement(item);
        });
        window.removeEventListener("config-updated", this.onConfigUpdate.bind(this));
        window.addEventListener("config-updated", this.onConfigUpdate.bind(this));
    };

    static createContent(config) {
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
                    <div id="${item.id}${item.html}"></div>
                `;
            });

            if (index !== groupKeys.length - 1) {
                content += '<hr>';
            }
        });
        return content;
    }
}
