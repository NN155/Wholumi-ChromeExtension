class Button extends Element {
    constructor({ 
        text = "", 
        onClick = null, 
        place = null, 
        placeAfter=null, 
        placeBefore=null, 
        display = true, 
        disabled = false 
    } = { 
        text: "", 
        onClick: null, 
        place: null,
        placeAfter:null, 
        placeBefore:null, 
        display: true, 
        disabled: false 
    }) {
        super("button", "flex");
        this.button = this.element;
        this.onClick = onClick;
        this.button.className = 'button--primary extension';
        this.button.style.userSelect = "none";
        this.button.onclick = this._onclick.bind(this);
        this.text(text);
        disabled && this.disable();
        this.display(display);
        place && this.place(place);
        placeAfter && this.placeAfter(placeAfter);
        placeBefore && this.placeBefore(placeBefore);
    }

    async _onclick() {
        this.disable()
        try {
            this.onClick && await this.onClick();
        }
        finally {
            this.enable();
        }

    }

    addEventListener(event, func) {
        this.button.addEventListener(event, func);
    }

    text(text) {
        this.button.textContent = text;
    }

    disable() {
        this.button.disabled = true;
        this.button.style.cursor = 'not-allowed';
        this.button.style.opacity = '0.5';
        this.button.style.pointerEvents = 'none';
    }

    enable() {
        this.button.disabled = false;
        this.button.style.cursor = 'pointer';
        this.button.style.opacity = '1';
        this.button.style.pointerEvents = 'auto';
    }
    
    style(options) {
        Object.entries(options).forEach(([property, value]) => {
            this.button.style[property] = value;
        });
    }

    display(display) {
        this.button.style.display = display ? 'block' : 'none';
    }
}