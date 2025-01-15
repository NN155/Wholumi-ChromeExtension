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

class CustomMenuButton {
    constructor(options = {}) {
        const defaults = {
            id: 'customButton',
            text: 'Click me',
            label: 'Function',
            disabled: false,
            onclick: () => { },
        };

        this.settings = { ...defaults, ...options };
    }
    async _onclick() {
        this.button.disabled = true;
        try {
            await this.settings.onclick();
        }
        finally {
            this.button.disabled = false;
        }
    }
    render(target) {

        if (!(target instanceof HTMLElement)) {
            console.error('Target element must be a valid HTML element.');
            return;
        }

        target.innerHTML = `
        <div class="custom-button-container">
            <button id="${this.settings.id}" class="extension">${this.settings.text}</button>
            <span class="label-text">${this.settings.label}</span>
        </div>
        `;
        this.button = target.querySelector(`button`)
        this.button.onclick = this._onclick.bind(this);
        
    }
    updateState(data) {
        if (!this.settings.data && !this.settings.subkey) return;
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        const button = shadowRoot.querySelector(`#${this.settings.id}`);
        if (button) {
            button.textContent = data[this.settings.subkey];
        }
    }
}