class TradeHistoryService {

    static cache = new CacheService();

    static async cancelSentTrades(username, {cache = false} = {}) {
        let data = cache ? this.cache.get({ method: "cancelSentTrades", id: username }) : null;
        if (data) return data;

        const url = UrlConstructor.getCancelSentHistoryLink(username);
        data = await this._getHistory(url);

        cache && this.cache.save({ method: "cancelSentTrades", id: username, count: data });
        return data;
    }

    static async cancelOfferTrades(username, {cache = false} = {}) {
        let data = cache ? this.cache.get({ method: "cancelOfferTrades", id: username }) : null;
        if (data) return data;

        const url = UrlConstructor.getCancelOfferHistoryLink(username);
        data = await this._getHistory(url);

        cache && this.cache.save({ method: "cancelOfferTrades", id: username, count: data });
        return data;
    }

    static async acceptedTrades(username, {cache = false} = {}) {
        let data = cache ? this.cache.get({ method: "acceptedTrades", id: username }) : null;
        if (data) return data;
        
        const url = UrlConstructor.getAcceptedHistoryLink(username);
        data = await this._getHistory(url);

        cache && this.cache.save({ method: "acceptedTrades", id: username, count: data });
        return data;
    }

    static async _getHistory(url) {
        const dom = await FetchService.parseFetch(url);
        const data = this._collectHistoryData(dom);
        let pageUrls = findPanel(dom)
        if (pageUrls) {
            const pagesData = await Promise.all(
                pageUrls.map(async (url) => {
                    const dom = await FetchService.parseFetch(url);
                    const data = this._collectHistoryData(dom);
                    return data;
                })
            );
            pagesData.forEach(pageData => data.push(...pageData));
        }
        return data;
    }

    static _collectHistoryData(dom) {
        const data = [];
        const items = dom.querySelectorAll('.history__item')
        if (items) {
            items.forEach(item => {
                const divs = item.querySelectorAll('.history__body');
                const cardsGained = this._convertDivToCard(divs[0]);
                const cardsLost = this._convertDivToCard(divs[1]);
                data.push({ rank: cardsLost[0].rank || cardsGained[0].rank, cardsGained, cardsLost });
            });
        }

        return data;
    }

    static _convertDivToCard(div) {
        try {
            const links = div.querySelectorAll('a');

            const cards = new CardsArray();
            links.forEach(link => {
                const div = document.createElement('div');
                div.innerHTML = link.outerHTML;
                const card = new Card(div);
                card.setSrc();
                card.rank = UrlConstructor.getRankBySrc(card.src);
                card.setCardId();
                cards.push(card);
            });

            return cards;
        } catch (err) {
            return new CardsArray(new Card());
        }
    }
}