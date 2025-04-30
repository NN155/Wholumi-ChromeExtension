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
            label: "",
            data: null,
            subkey: null,
            id: 'customButton',
            text: 'Click me',
            label: '',
            disabled: false,
            onclick: null,
            onEvent: null,
        };

        this.settings = { ...defaults, ...options, disabled: CustomMenuCallback.promises[options.id]};
    }

    async _onclick() {
        this.button.disabled = true;
        try {
            let data = null;
            if (this.settings.onclick) {
                data = await this.settings.onclick();
            }
            this.settings.onEvent && await this.sendEvent({ data, ...this.settings.onEvent });
        }
        finally {
            await new Promise(resolve => setTimeout(resolve, 50));
            this.button.disabled = false;
        }
    }

    render(target) {
        if (!(target instanceof HTMLElement)) {
            console.error('Target element must be a valid HTML element.');
            return;
        }

        target.innerHTML = `
        <div class="custom-button-container" style="margin-top: 10px; margin-bottom: 10px;">
            <button id="${this.settings.id}" ${this.settings.disabled ? 'disabled' : ''} class="extension">${this.settings.text}</button>
            <span class="label-text">${this.settings.label}</span>
        </div>
        `;
        this.button = target.querySelector(`button`)
        this.button.onclick = this._onclick.bind(this);
    }

    updateState(data) {
        if (!data) return;
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        const button = shadowRoot.querySelector(`#${this.settings.id}`);
        if (button) {
            button.textContent = data;
        }
    }

    async sendEvent({ key, event, data, ...rest }) {
        await CustomMenuCallback.sendEvent({ key, event, data, id: this.settings.id, ...rest });
    }
}

class CustomMenuCallback {
    static promises = {};

    static addEventListener() {
        window.addEventListener("button-task-completed", async (event) => {
            setTimeout(() => {
                const resolve = this.promises[event.detail.id];
                if (resolve) resolve();
            }, 0);
        });
    }

    static async sendEvent({ key, event, data, id, ...rest }) {
        const e = new CustomEvent(event, {
            detail: {
                key: key,
                id: id,
                data: data,
                event: "button-task-completed",
                ...rest,
            },
        });
        window.dispatchEvent(e);
        await new Promise(resolve => this.promises[id] = resolve);
    }
}

CustomMenuCallback.addEventListener();

class CustomMenuInput {
    constructor(options = {}) {
        const defaults = {
            id: 'customInput',
            label: 'Function',
            value: '',
            disabled: false,
            onChange: null,
            placeHolder: '',
            type: "text",
        };

        this.settings = { ...defaults, ...options };
    }

    render(target) {
        if (!(target instanceof HTMLElement)) {
            console.error('Target element must be a valid HTML element.');
            return;
        }

        target.innerHTML = `
            <div>
            <input 
                class="custom-input-extension"
                autocomplete="off"
                type="${this.settings.type}"
                id="${this.settings.id}" 
                value="${this.settings.value}" 
                ${this.settings.disabled ? 'disabled' : ''}
                placeholder="${this.settings.placeHolder}"
                >
            <label for="${this.settings.id}">${this.settings.label}</label>
            </div>
        `;

        const input = target.querySelector(`#${this.settings.id}`);
        if (input && typeof this.settings.onChange === 'function') {
            input.addEventListener('change', (e) => this.settings.onChange(e.target.value));
        }
    }
    getValue() {
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        return shadowRoot.querySelector(`#${this.settings.id}`).value;
    }

    updateState(data) {
        if (!this.settings.data || !this.settings.subkey) return;
        if (data[this.settings.subkey] === undefined) return;
        const shadowRoot = document.querySelector("#custom-window").shadowRoot;
        const input = shadowRoot.querySelector(`#${this.settings.id}`);
        if (input) {
            if (input.value !== "") {
                input.value = data[this.settings.subkey];
            }
            input.placeholder = data[this.settings.subkey];
        }
    }
}

class CustomMenuColor {
    constructor(options = {}) {
        const defaults = {
            id: 'customColor',
            label: 'Function',
            value: '',
            disabled: false,
            onChange: null,
            placeHolder: '',
        };

        this.settings = { ...defaults, ...options };
    }

    render(target) {
        if (!(target instanceof HTMLElement)) {
            console.error('Target element must be a valid HTML element.');
            return;
        }

        target.innerHTML = `
                <div style="margin-top: 10px; margin-bottom: 10px;">
                <input type="color" id="${this.settings.id}" value="${this.settings.value}" />
                <label for="${this.settings.id}">${this.settings.label}</label>
                </div>
        `;

        const input = target.querySelector(`#${this.settings.id}`);
        input.addEventListener("input", (event) => {
            this.colorUpdate(event.target.value, this.settings.targetVariable);
        });
    }

    colorUpdate(newColor, property) {
        const windowDiv = document.querySelector("#custom-window");
        if (newColor) {
            windowDiv.style.setProperty(property, newColor);
        }
    };
}