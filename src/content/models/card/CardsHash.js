class CardsHash {
    constructor() {
        this.hash = {};
    }

    add(card) {
        this.hash[card.src] = (this.hash[card.src] || 0) + 1;
    }

    remove(card) {
        this.removeBySrc(card.src);
    }

    removeBySrc(src) {
        if (this.hash[src]) {
            this.hash[src]--;
            if (this.hash[src] === 0) {
                delete this.hash[src];
            }
        }
    }

    has(card) {
        return this.hasBySrc(card.src);
    }

    hasBySrc(src) {
        return this.hash[src] > 0;
    }

    get length() {
        return Object.keys(this.hash).length;
    }
}