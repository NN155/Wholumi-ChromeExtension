/**
 * Service for card-related URLs
 */
class CardUrlService {
    /**
     * Create URL to card detail page
     * @param {string|number} cardId - Card ID
     * @param {boolean} unlocked - Get unlocked version
     * @returns {string} - Card URL
     */
    static getCardUrl(cardId, unlocked = false) {
        return UrlService.buildUrl(`/cards/${cardId}/users/`, 
            unlocked ? { unlocked: 1 } : {});
    }
    
    /**
     * Create URL to card need page
     * @param {string|number} cardId - Card ID
     * @returns {string} - Card need URL
     */
    static getCardNeedUrl(cardId) {
        return `/cards/${cardId}/users/need/`;
    }
    
    /**
     * Create URL to card trade page
     * @param {string|number} cardId - Card ID
     * @returns {string} - Card trade URL
     */
    static getCardTradeUrl(cardId) {
        return `/cards/${cardId}/users/trade/`;
    }
    
    /**
     * Extract card ID from URL
     * @param {string} url - URL containing card ID
     * @returns {string|null} - Card ID
     */
    static getCardId(url) {
        return UrlService.extractParam(url, /\/cards\/(\d+)\//);
    }
    
    /**
     * Get card rank from URL
     * @param {string} url - URL containing rank parameter
     * @returns {string|null} - Card rank lowercase
     */
    static getCardRank(url = window.location.href) {
        const rankParam = UrlService.getParams(url).get('rank');
        return rankParam ? rankParam.toLowerCase() : null;
    }
    
    /**
     * Extract rank from card image URL
     * @param {string} src - Card image source URL
     * @returns {string|null} - Card rank
     */
    static getRankBySrc(src) {
        if (!src) return null;
        
        const match = src.match(/\/uploads\/cards_image\/\d+\/([a-z])\/[^/]+$/);
        return match ? match[1].toLowerCase() : null;
    }
    
    /**
     * Get card name by ID
     * @param {string|number} id - Card ID
     * @returns {Promise<string|null>} - Card name
     */
    static async getCardName(id) {
        try {
            const url = this.getCardNeedUrl(id);
            const dom = await FetchService.parseFetch(url);
            
            const titleElement = dom.querySelector(".secondary-title.text-center a");
            return titleElement ? titleElement.textContent.trim() : null;
        } catch (error) {
            console.error("Error getting card name:", error);
            return null;
        }
    }
    
    /**
     * Create URL for trading
     * @param {string|number} wantedCardId - Card to receive
     * @param {string|number|null} tradedCardId - Card to give
     * @returns {string} - Trade URL
     */
    static tradeLink(wantedCardId, tradedCardId = null) {
        return UrlService.buildUrl(
            `/cards/${wantedCardId}/trade`, 
            tradedCardId ? { mycard: tradedCardId } : {}
        );
    }
}