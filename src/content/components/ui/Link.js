class Link extends Element {
    constructor({
        text="",
        href = "",
        place = null,
        placeAfter = null,
        placeBefore = null,
        disable = false,
        onClick = null,
        display = true,
        className = "",
    } = {
        text: "",
        href: "",
        place: null,
        placeAfter: null,
        placeBefore: null,
        disable: false,
        onClick: null,
        display: true,
        className: "",
    }) {
        super("a", "flex")
        this.onClick = onClick
        this.element.textContent = text
        this.element.href = href
        this.element.className = className
        this._style()
        this.element.onclick = this._onClick.bind(this)
        disable && this.disable()
        this.display(display);
        place && this.place(place)
        placeAfter && this.placeAfter(placeAfter)
        placeBefore && this.placeBefore(placeBefore)
    }

    _style() {
        this.element.style.backgroundColor = "#772ce8"
        this.element.style.color = "#fff"
        this.element.style.alignItems = "center"
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