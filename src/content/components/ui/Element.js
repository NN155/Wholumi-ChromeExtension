class Element {
    constructor(type = "div") {
        this.element = document.createElement(type);
    }

    place(querySelector) {
        const container = document.querySelector(querySelector);
        container.appendChild(this.element);
    }

    async asyncPlace(querySelector) {
        const container = await this._waitDiv(querySelector);
        container.appendChild(this.element);
    }

    display(bool) {
        this.element.style.display = bool ? "flex" : "none";
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