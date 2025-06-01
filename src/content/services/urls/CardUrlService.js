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
    static getCardUrl(cardId, unlocked) {
        const params = { id: cardId };
        if (unlocked) {
            params.unlocked = 1;
        }
        return UrlService.buildUrl(`/cards/users/`, params);
    }

    /**
     * Create URL to card need page
     * @param {string|number} cardId - Card ID
     * @returns {string} - Card need URL
     */
    static getCardNeedUrl(cardId) {
        return `/cards/users/need/?id=${cardId}`;
    }

    /**
     * Create URL to card trade page
     * @param {string|number} cardId - Card ID
     * @returns {string} - Card trade URL
     */
    static getCardTradeUrl(cardId) {
        return `/cards/users/trade/?id=${cardId}`;
    }

    /**
     * Extract card ID from URL
     * @param {string} url - URL containing card ID
     * @returns {string|null} - Card ID
     */
    static getCardId(url) {
        // Search new format with query parameter
        const urlObj = new URL(url);
        const queryId = urlObj.searchParams.get('id');
        if (queryId) {
            return queryId;
        }

        // Search old format with path parameter
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

            const titleElement = dom.querySelector(".ncard__main-title a");
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
    static tradeLink(wantedCardId, tradedCardId = null, unlock = null) {
        const params = {};

        if (tradedCardId) {
            params.mycard = tradedCardId;
            if (unlock) {
                params.unlock = 1;
            }
        }

        return UrlService.buildUrl(
            `/cards/${wantedCardId}/trade`,
            params
        );
    }

    static getStarsCount(url) {
        if (!url) return 0;

        const starsMatch = url.match(/stars_(\d+)/);
        if (starsMatch && starsMatch[1]) {
            const starsCount = parseInt(starsMatch[1], 10);
            return isNaN(starsCount) ? 0 : starsCount;
        }

        return 0;
    }
}