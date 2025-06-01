class Box extends Element {
    constructor({
        place = null,
        placeAfter = null,
        placeBefore = null,
        display = true,
        displayType = "block",
        className = "box-extension",
        center = false,
        ...styleOptions
    } = {
        place: null,
        placeAfter: null,
        placeBefore: null,
        display: true,
        displayType: "block",
        className: "box-extension",
        center: false,
        styleOptions: {},
        }) {
        super("div", displayType);
        this.element.className = className;
        this._style();
        this.style(styleOptions);

        center && this.styleCenterItems();
        this.display(display);
        place && this.place(place);
        placeAfter && this.placeAfter(placeAfter);
        placeBefore && this.placeBefore(placeBefore);
    }

    styleCenterItems() {
        this.element.style.justifyContent = "center";
        this.element.style.alignItems = "center";
    }

    _style() {
        if (this.displayType === "block" || this.displayType === "inline-block") {
            if (this.displayType === "block") {
                this.displayType = "flex";
            }
            else {
                this.displayType = "inline-flex";
            }

            this.element.style.flexDirection = "column";
            this.element.style.margin = "0.5em";
        }
    }
}