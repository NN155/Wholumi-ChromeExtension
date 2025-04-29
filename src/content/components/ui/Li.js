class Li extends Element {
    constructor({
        text="",
        place = null,
        placeAfter = null,
        placeBefore = null,
        disable = false,
        onClick = null,
        display = true,
    } = {
        text: "",
        place: null,
        placeAfter: null,
        placeBefore: null,
        disable: false,
        onClick: null,
        display: true,
    }) {
        super("li")
        this.onClick = onClick
        this.element.textContent = text
        this._style()
        this.element.onclick = this._onClick.bind(this)
        disable && this.disable()
        this.display(display);
        place && this.place(place)
        placeAfter && this.placeAfter(placeAfter)
        placeBefore && this.placeBefore(placeBefore)
    }

    _style() {
        this.element.style.cursor = "pointer"
        this.element.style.color = "#772ce8"
    }

    disable() {
        this.element.style.cursor = "default"
        this.element.onClick = () => { }
        this.element.style.color = "#4a2c8f"
    }

    enable() {
        this._style()
        this.element.onClick = this.funk
    }

    async _onClick() {
        this.disable()
        try {
            this.onClick && await this.onClick();
        }
        finally {
            this.enable();
        }
    }
}