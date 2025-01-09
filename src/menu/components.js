class CustomMenuSwitcher {
    constructor(options = {}) {
        const defaults = {
            id: 'customSwitch',
            label: 'Function',
            checked: false,
            disabled: false,
            onChange: null,
        };

        this.settings = { ...defaults, ...options };
    }

    render(target) {
        if (!(target instanceof HTMLElement)) {
            console.error('Target element must be a valid HTML element.');
            return;
        }

        target.innerHTML = `
            <div class="custom-switch-extension">
                <label class="switch-extension">
                    <input type="checkbox" 
                           id="${this.settings.id}" 
                           ${this.settings.checked ? 'checked' : ''} 
                           ${this.settings.disabled ? 'disabled' : ''}>
                    <span class="slider-extension round"></span>
                </label>
                <p>${this.settings.label}</p>
            </div>
        `;

        const input = target.querySelector(`#${this.settings.id}`);
        if (input && typeof this.settings.onChange === 'function') {
            input.addEventListener('change', (e) => this.settings.onChange(e.target.checked));
        }
    }
    updateState(newChecked) {
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        const checkbox = shadowRoot.querySelector(`#${this.settings.id}`);
        if (checkbox) {
            checkbox.checked = newChecked;
        }
    }
}