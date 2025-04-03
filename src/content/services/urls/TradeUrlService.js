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
    

    static getAcceptedHistoryLink(username = "") {
        return `/trades/history/${username ? `?user=${username}` : ""}`;
    }

    static getCancelSentHistoryLink(username = "") {
        return `${this.getAcceptedHistoryLink()}?kind=calsel_sender${username ? `&user=${username}` : ""}`;
    }

    static getCancelOfferHistoryLink(username = "") {
        return `${this.getAcceptedHistoryLink()}?kind=calsel_reciever${username ? `&user=${username}` : ""}`;
    }
 
}