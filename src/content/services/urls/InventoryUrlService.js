class InventoryUrlService {
    /**
     * Create a URL constructor for specific user and rank
     * @param {Object} options - Constructor options
     * @param {string} options.rank - Card rank
     * @param {string} options.user - User
     */
    constructor({ rank, user }) {
        this.user = user;
        this.rank = rank;
    }
    
    /**
     * Get inventory URL
     * @returns {string} - Inventory URL
     */
    inventory(url = null) {
        if (url) {
            return UrlService.buildUrl(url, { rank: this.rank });
        } else {
            return UrlService.buildUrl(`/user/cards/`, { rank: this.rank, name: this.user.username });
        }
    }
    
    /**
     * Get need list URL
     * @returns {string} - Need list URL
     */
    need() {
        return UrlService.buildUrl(`/user/cards/need/`, { name: this.user.username, rank: this.rank });
    }
    
    /**
     * Get trade list URL
     * @returns {string} - Trade list URL
     */
    trade() {
        return UrlService.buildUrl(`/user/cards/trade/`, { name: this.user.username, rank: this.rank });
    }
    
    /**
     * Get search URL
     * @param {string} name - Card name to search
     * @returns {string} - Search URL
     */
    search(name) {
        return this.inventory() + "&search=" + encodeURIComponent(name);
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