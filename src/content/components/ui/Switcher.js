class Switcher extends Element {
    constructor({ checked = false, onChange = null, place = null, text = "", disabled = false, display = true } = { checked: false, onChange: null, place: null, text: "", disabled: false, display: true }) {
        super();

        this.checked = checked;
        this.onChange = onChange;

        this.createSwitch();

        this.text(text);
        disabled && this.disable();
        this.display(display);
        place && this.place(place);
    }

    createSwitch() {
        this.element.className = 'switch-component-extension';

        this.element.innerHTML = `
            <label class="switch-extension">
                <input type="checkbox" ${this.checked ? 'checked' : ''}>
                <span class="slider-extension round"></span>
                <span class="switch-label-text"></span>
            </label>
        `;

        const input = this.element.querySelector('input');
        input.addEventListener('change', (event) => {
            this.checked = event.target.checked;
            if (this.onChange) {
                this.onChange(this.checked);
            }
        });
    }

    text(labelText) {
        const labelTextElement = this.element.querySelector('.switch-label-text');
        labelTextElement.innerText = labelText;
    }

    center() {
        this.element.style.margin = "10px"
        this.element.style.display = "flex"
        this.element.style.justifyContent = "center"
        this.element.style.alignItems = "center"
    }

    disable() {
        this.isDisabled = true;
        const input = this.element.querySelector('input');
        input.disabled = true;
        this.element.classList.add('disabled');
    }

    enable() {
        this.isDisabled = false;
        const input = this.element.querySelector('input');
        input.disabled = false;
        this.element.classList.remove('disabled');
    }

    turnOff() {
        const input = this.element.querySelector('input');
        input.checked = false;
        this.checked = false;
        if (this.onChange) {
            this.onChange(this.checked);
        }
    }

    turnOn() {
        const input = this.element.querySelector('input');
        input.checked = true;
        this.checked = true;
        if (this.onChange) {
            this.onChange(this.checked);
        }
    }
}