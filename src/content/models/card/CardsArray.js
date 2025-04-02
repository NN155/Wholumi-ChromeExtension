class CardsArray extends Array {
    sort(sortByNeedCountAsc = false) {
        super.sort((a, b) => {
            if (b.sortPriority !== a.sortPriority) {
                return b.sortPriority - a.sortPriority;
            }
            if (b.rate !== a.rate) {
                return b.rate - a.rate;
            }
            if (b.cardId !== a.cardId) {
                return b.cardId - a.cardId;
            }
            return sortByNeedCountAsc ? a.needCount - b.needCount : b.needCount - a.needCount;
        });
    }

    getLockedCards() {
        return new CardsArray(...super.filter(card => card.lock === "lock"));
    }

    getCardsArray() {
        const arr = [];
        this.forEach(card => arr.push(card.card));
        return arr;
    }

    filter(callback) {
        const filtered = super.filter(callback);
        
        this.length = 0;
        
        for (let i = 0; i < filtered.length; i++) {
            this[i] = filtered[i];
        }
        
        return this
    }
    clone() {
        return new CardsArray(...this);
    }

    random() {
        return this[Math.floor(Math.random() * this.length)];
    }

    min(field) {
        return this.reduce((min, card) => (card[field] < min[field] ? card : min), this[0]);
    }

    max(field) {
        return this.reduce((max, card) => (card[field] > max[field] ? card : max), this[0]);
    }
    
    Filter(callback) {
        const filtered = super.filter(callback);
        const newCardsArray = new CardsArray(...filtered);
        return newCardsArray;
    }

    unique(property = 'cardId') {
        const seen = new Set();
        const uniqueCards = this.Filter(card => {
            if (!card || typeof card[property] === 'undefined') return true;
            
            const val = card[property];
            if (seen.has(val)) {
                return false;
            }
            seen.add(val);
            return true;
        });
        
        return uniqueCards;
    }
}
