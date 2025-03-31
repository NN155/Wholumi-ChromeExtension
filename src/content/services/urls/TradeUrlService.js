/**
 * Service for trade-related URLs
 */
class TradeUrlService {
    /**
     * Get URL for sent trades
     * @param {string|number|null} id - Trade ID
     * @returns {string} - Sent trades URL
     */
    static getSentLink(id = null) {
        return id ? `/trades/offers/${id}/` : '/trades/offers/';
    }
    
    /**
     * Get URL for received trade offers
     * @param {string|number|null} id - Trade ID
     * @returns {string} - Received trades URL
     */
    static getOfferLink(id = null) {
        return id ? `/trades/${id}/` : '/trades/';
    }
    
    /**
     * Extract anime ID from URL
     * @param {string} url - Anime URL
     * @returns {string|null} - Anime ID
     */

}