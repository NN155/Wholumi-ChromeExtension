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
        super("a", "flex")
        this.element.textContent = text
        this.element.href = href
        this.element.className = `wholumi ${className}`.trim();
        disable && this.disable()
        this.display(display);
        place && this.place(place)
        placeAfter && this.placeAfter(placeAfter)
        placeBefore && this.placeBefore(placeBefore)
    }

    disable() {

        this._originalOnClick = this.element.onclick;
        this.element.onclick = null;

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