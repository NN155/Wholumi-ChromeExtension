function settingTab() {
    const content = `
        <div>
            <input type="color" id="main-helper-tabs-color" value="#8a1ec9" />
            <input type="color" id="second-helper-tabs-color" value="#34495e" />
            <input type="color" id="helper-text-color" value="#ecf0f1" />
        </div>
    `;

    const tab = new Tab('Settings', content);

    tab.onActivate = () => {
        const windowDiv = document.querySelector("#custom-window");
        const shadowRoot = windowDiv.shadowRoot;
        const mainHelperTabsColor = shadowRoot.querySelector("#main-helper-tabs-color");
        const secondHelperTabsColor = shadowRoot.querySelector("#second-helper-tabs-color");
        const helperTextColor = shadowRoot.querySelector("#helper-text-color");
        mainHelperTabsColor.addEventListener("input", (event) => {
            colorUpdate(event.target.value, "--main-helper-tabs-color");
        });
        secondHelperTabsColor.addEventListener("input", (event) => {
            colorUpdate(event.target.value, "--second-helper-tabs-color");
        });
        helperTextColor.addEventListener("input", (event) => {
            colorUpdate(event.target.value, "--helper-text-color");
        });

        function colorUpdate(newColor, property) {
            if (newColor) {
                windowDiv.style.setProperty(property, newColor);
            }
        };
    }

    return tab;
}
