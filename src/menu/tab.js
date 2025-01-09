class Tab {
    constructor(tabName, content, menu) {
        this.tabName = tabName;
        this.content = content;
        this.isActive = false;
        this.funcitonConfig = null;
    }

    render() {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${this.isActive ? 'active' : ''}`;
        tabElement.textContent = this.tabName;

        // Обробник натискання на вкладку
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

        const activeTab = document.querySelector(`.tab[data-tab="${this.tabName}"]`);
        activeTab.classList.add('active');

        const activeContent = document.querySelector(`.window-content[data-tab="${this.tabName}"]`);
        activeContent.style.display = 'block';
    }

    renderContent() {
        const contentElement = document.createElement('div');
        contentElement.className = 'window-content';
        contentElement.setAttribute('data-tab', this.tabName);
        contentElement.innerHTML = this.content;
        return contentElement;
    }

    async updateConfig() {
        this.functionConfig = await ExtensionConfig.getConfig();
    }

    async setConfig(newConfig) {
        await ExtensionConfig.setConfig(newConfig);
        this.functionConfig = await ExtensionConfig.getConfig();
    }
}
