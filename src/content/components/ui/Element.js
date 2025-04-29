class Element {
    constructor(type = "div", displayType= "block") {
        this.element = document.createElement(type);
        this.displayType = displayType;
    }

    place(querySelector) {
        const container = document.querySelector(querySelector);
        this._place(container);
    }

    async asyncPlace(querySelector) {
        const container = await this._waitDiv(querySelector);
        this._place(container);
    }

    _place(container) {
        container.appendChild(this.element);
    }

    placeAfter(selector) {
        const container = document.querySelector(selector);
        this._placeAfter(container);
    }

    async asyncPlaceAfter(querySelector) {
        const container = await this._waitDiv(querySelector);
        this._placeAfter(container);
    }

    _placeAfter(container) {
        container.parentNode.insertBefore(this.element, container.nextSibling);
    }

    placeBefore(selector) {
        const container = document.querySelector(selector);
        this._placeBefore(container);
    }

    async asyncPlaceBefore(querySelector) {
        const container = await this._waitDiv(querySelector);
        this._placeBefore(container);
    }

    _placeBefore(container) {
        container.parentNode.insertBefore(this.element, container);
    }

    display(bool) {
        this.element.style.display = bool ? this.displayType : "none";
    }

    _waitDiv(querySelector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const intervalTime = 100;
            let elapsed = 0;

            const interval = setInterval(() => {
                const element = document.querySelector(querySelector);
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                } else if (elapsed >= timeout) {
                    clearInterval(interval);
                    reject(new Error(`Element ${querySelector} did not appear within ${timeout} ms`));
                }
                elapsed += intervalTime;
            }, intervalTime);
        });
    }
}