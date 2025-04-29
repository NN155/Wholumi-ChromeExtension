class Input extends Element {
    constructor({ 
        text = "", 
        display = true, 
        place = null,
        placeAfter=null, 
        placeBefore=null, 
    } = { 
        text: "", 
        display: true, 
        place: null,
        placeAfter:null, 
        placeBefore:null, 
    }) {
        super("input")

        this.element.className = "input-extension"
        this.element.type = "text";
        this.style()

        text && this.text(text);
        this.display(display);
        place && this.place(place);
        placeAfter && this.placeAfter(placeAfter);
        placeBefore && this.placeBefore(placeBefore);
    }
    style() {
        this.element.style.width = "200px";
        this.element.style.height = "36px";
        this.element.style.marginLeft = "10px";
        this.element.style.borderRadius = "5px";
        this.element.style.border = "1px solid #772ce8";
    }

    getValue() {
        return this.element.value
    }

    setValue(value) {
        this.element.value = value
    }

    text(text) {
        this.element.placeholder = text;
    }
}