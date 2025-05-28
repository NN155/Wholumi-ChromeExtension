class ShowBar {
    static createShowBar() {
        let showBar = document.getElementById('show-bar');

        if (!showBar) {
            showBar = document.createElement('div');
            showBar.id = 'show-bar';
            showBar.style.width = '100%';
            showBar.style.marginTop = '50px';
            showBar.style.display = 'flex';
            showBar.style.flexWrap = 'wrap';
            showBar.style.justifyContent = 'space-around';
            const container = document.querySelector(".ncard") || document.querySelector('.ncard__main');
            if (container) {
                container.appendChild(showBar);
            } else {
                console.error("Container element not found");
            }
        } else {
            while (showBar.firstChild) {
                showBar.removeChild(showBar.firstChild);
            }
        }
        this.showBar = showBar;
    }

    static addElementsToBar(elements) {
        if (elements.length === 0) {
            this.text("No cards found");
        }
        else {
            elements.forEach(element => {
                this.showBar.appendChild(element);
            });
        }
    }

    static replaceElementsInBar(elements) {
        while (this.showBar.firstChild) {
            this.showBar.removeChild(this.showBar.firstChild);
        }
        this.addElementsToBar(elements);
    }

    static text(text) {
        this.showBar.textContent = text;
    }
}