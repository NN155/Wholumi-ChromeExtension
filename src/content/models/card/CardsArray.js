class CardsArray extends Array {
    sort({sortByNeedCountAsc = false, byTradeCard = false} = {}) {
        super.sort((a, b) => {
            if (b.sortPriority !== a.sortPriority) {
                return b.sortPriority - a.sortPriority;
            }
            if (b.rate !== a.rate) {
                return b.rate - a.rate;
            }
            if (byTradeCard && b.tradeCard && a.tradeCard) {
                if (b.tradeCard.cardId !== a.tradeCard.cardId) {
                    return b.tradeCard.cardId - a.tradeCard.cardId;
                }
            } else if  (b.cardId !== a.cardId) {
                return b.cardId - a.cardId;
            }
            return sortByNeedCountAsc ? a.needCount - b.needCount : b.needCount - a.needCount;
        });
    }

    getCardsByLock(lock) {
        return this.Filter(card => card.lock === lock);
    }

    getBestCards({cardId = null}) {
        const lockPriority = ["unlock", "lock", "trade", "trophy", "star"];
        const lockMap = new Map();
        for (const card of this) {
            if (!cardId || card.cardId === cardId) {
                if (!lockMap.has(card.lock)) lockMap.set(card.lock, []);
                lockMap.get(card.lock).push(card);
            }
        }
        
        for (const lock of lockPriority) {
            if (lockMap.has(lock)) {
                return new CardsArray(...lockMap.get(lock));
            }
        }
        return new CardsArray();
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

    deepClone() {
        const clonedArray = new CardsArray();
        for (const card of this) {
            clonedArray.push(card.clone());
        }
        return clonedArray;
    }

    random() {
        return this[Math.floor(Math.random() * this.length)];
    }

    min(field) {
        return this.reduce((min, card) => (card[field] < min[field] ? card : min), this[0]);
    }

    minTradeCard(field) {
        return this.reduce((min, card) => (card.tradeCard[field] < min.tradeCard[field] ? card : min), this[0]);
    }

    max(field) {
        return this.reduce((max, card) => (card[field] > max[field] ? card : max), this[0]);
    }

    maxTradeCard(field) {
        return this.reduce((max, card) => (card.tradeCard[field] > max.tradeCard[field] ? card : max), this[0]);
    }

    Filter(callback) {
        return new CardsArray(...super.filter(callback));
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

    withoutStars() {
        this.filter(card => card.lock !== "star");
    }
}
