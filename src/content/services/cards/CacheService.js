class CacheService {
    constructor() {
        this.cache = new Map();
    }

    save({ method, rank, userName, cards, count, id }) {
        if (!this.cache[method]) {
            this.cache[method] = {};
        }
    
        if (rank) {
            if (!this.cache[method][rank]) {
                this.cache[method][rank] = {};
            }
            this.cache[method][rank][userName] = cards.clone();
            return;
        } else if (id) {
            this.cache[method][id] = count;
            return;
        }
    }
    
    get({ method, rank, userName, id }) {
        if (this.cache[method]) {
            if (rank) {
                if (this.cache[method][rank] && this.cache[method][rank][userName]) {
                    return this.cache[method][rank][userName].clone();
                }
            } else if (id) {
                if (this.cache[method][id]) {
                    return this.cache[method][id];
                }
            }
        }
        return null;
    }
    
    delete({ method, rank, userName, cardId, id }) {
        if (this.cache[method]) {
            if (rank) {
                if (this.cache[method][rank] && this.cache[method][rank][userName]) {
                    if (id) this.cache[method][rank][userName].filter(card => card.id !== id);
                    else if (cardId) this.cache[method][rank][userName].filter(card => card.cardId !== cardId);
                    else delete this.cache[method][rank][userName];
                }
            }
        }
    }
}