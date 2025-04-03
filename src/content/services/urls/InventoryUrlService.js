class InventoryUrlService {
    /**
     * Create a URL constructor for specific user and rank
     * @param {Object} options - Constructor options
     * @param {string} options.rank - Card rank
     * @param {string} options.userUrl - User URL
     */
    constructor({ rank, userUrl }) {
        this.userUrl = userUrl;
        this.rank = rank ? `?rank=${rank}` : '';
    }
    
    /**
     * Get inventory URL
     * @returns {string} - Inventory URL
     */
    inventory() {
        return this.userUrl + '/cards/' + this.rank;
    }
    
    /**
     * Get need list URL
     * @returns {string} - Need list URL
     */
    need() {
        return this.userUrl + '/cards/need/' + this.rank;
    }
    
    /**
     * Get trade list URL
     * @returns {string} - Trade list URL
     */
    trade() {
        return this.userUrl + '/cards/trade/' + this.rank;
    }
    
    /**
     * Get search URL
     * @param {string} name - Card name to search
     * @returns {string} - Search URL
     */
    search(name) {
        return this.userUrl + "/cards/" + this.rank + "&search=" + encodeURIComponent(name);
    }
    
    /**
     * Add unlock parameter to URL
     * @param {string} url - Base URL
     * @param {boolean} unlock - Unlock parameter
     * @returns {string} - URL with unlock parameter
     */
    unlock(url, unlock = true) {
        return url += `${unlock !== null ? `&locked=${unlock ? 0 : 1}` : ""}`;
    }
    
    /**
     * Create URL parameters string
     * @param {string|null} rank - Card rank
     * @param {boolean|null} unlock - Unlock parameter
     * @returns {string} - URL parameters string
     */
    static params(rank = null, unlock = null) {
        return `?${rank ? `rank=${rank}` : ""}${unlock !== null ? `&locked=${unlock ? 0 : 1}` : ""}`;
    }
}