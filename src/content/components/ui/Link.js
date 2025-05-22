class Link extends Element {
    constructor({
        text = "",
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
        console.log("Link", { text, href, place, placeAfter, placeBefore, disable, onClick, display, className })
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
        this.element.style.alignItems = "center"
        this.element.style.cursor = "pointer"
        this.element.style.userSelect = "none"
    }

    disable() {

        this._originalOnClick = this.element.onclick;
        this.element.onclick = null;

        this.element.style.backgroundColor = "#4a2c8f"
        this.element.style.cursor = "default"

        this._href = this.element.getAttribute('href')
        this.element.removeAttribute('href')
        this.element.setAttribute('aria-disabled', 'true')
    }

    enable() {

        if (this._originalOnClick) {
            this.element.onclick = this._originalOnClick;
        }

        if (this._href) {
            this.element.setAttribute('href', this._href);
        }

        this._style()
        this.element.setAttribute('href', this.href)
        this.element.setAttribute('aria-disabled', 'false')
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