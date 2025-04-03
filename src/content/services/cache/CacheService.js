class CacheService {
    constructor() {
        this.cache = new Map();
    }

    save({ method, rank, username, cards, count, id }) {
        if (!this.cache[method]) {
            this.cache[method] = {};
        }
    
        if (rank) {
            if (!this.cache[method][rank]) {
                this.cache[method][rank] = {};
            }
            this.cache[method][rank][username] = cards.clone();
            return;
        } else if (id) {
            this.cache[method][id] = count;
            return;
        }
    }
    
    get({ method, rank, username, id }) {
        if (this.cache[method]) {
            if (rank) {
                if (this.cache[method][rank] && this.cache[method][rank][username]) {
                    return this.cache[method][rank][username].clone();
                }
            } else if (id) {
                if (this.cache[method][id]) {
                    return this.cache[method][id];
                }
            }
        }
        return null;
    }
    
    delete({ method, rank, username, cardId, id }) {
        if (this.cache[method]) {
            if (rank) {
                if (this.cache[method][rank] && this.cache[method][rank][username]) {
                    if (id) this.cache[method][rank][username].filter(card => card.id !== id);
                    else if (cardId) this.cache[method][rank][username].filter(card => card.cardId !== cardId);
                    else delete this.cache[method][rank][username];
                }
            } else if (id) {
                if (this.cache[method][id]) {
                    delete this.cache[method][id];
                }
            }
        }
    }
}