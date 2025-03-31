class Li extends Element {
    constructor(text) {
        super("li")
        this.onclick = null
        this.element.textContent = text
        this._style()
        this.element.onclick = this._onclick.bind(this)
    }

    _style() {
        this.element.style.cursor = "pointer"
        this.element.style.color = "#772ce8"
    }

    disable() {
        this.element.style.cursor = "default"
        this.element.onclick = () => { }
        this.element.style.color = "#4a2c8f"
    }
    enable() {
        this._style()
        this.element.onclick = this.funk
    }
    place(queryParams) {
        const container = document.querySelector(queryParams)
        container.appendChild(this.element)
    }

    async _onclick() {
        this.disable()
        try {
            this.onclick && await this.onclick();
        }
        finally {
            this.enable();
        }

    }
}