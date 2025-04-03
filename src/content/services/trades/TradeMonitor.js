class TradeMonitorService {
    static async getOffers() {
        return await this._getTradesInfo('getAllOffers');
    }

    static async getSent() {
        return await this._getTradesInfo('getAllSent');
    }

    static async _getTradesInfo(method) {
        const tradesIds = await this[method]();
        const tradesInfo = await Promise.all(tradesIds.map(async (tradeId) => {
            const tradeInfo = await this.tradeInfo(tradeId);
            return { tradeId, ...tradeInfo };
        }));
        return tradesInfo;
    }

    static async getAllOffers() {
        return await this._getAllTrades(UrlConstructor.getOfferLink());
    }

    static async getAllSent() {
        return await this._getAllTrades(UrlConstructor.getSentLink());
    }

    static async _getAllTrades(url) {
        const dom = await FetchService.parseFetch(url);
        const tradeList = dom.querySelector('.trade__list');

        const links = tradeList ? tradeList.querySelectorAll('a') : [];
        const tradeIds = [];
        links.forEach((link) => {
            const href = link.getAttribute('href');

            let match = href.match(/^\/trades\/(\d+)\//);

            if (!match) {
                match = href.match(/^\/trades\/offers\/(\d+)\//);
            }
            
            if (match) {
                tradeIds.push(match[1]);
            }
        });
        return tradeIds;
    }
    
    static async tradeInfo(tradeId, isOffer) {
        const url = isOffer ? UrlConstructor.getOfferLink(tradeId) : UrlConstructor.getSentLink(tradeId);
        const dom = await FetchService.parseFetch(url)
        const tradeMainItems = dom.querySelectorAll('.trade__main-items');

        if (tradeMainItems.length >= 2) {
            const tradeCards = this._splitTradeInfo(tradeMainItems[0]);
            const userCards = this._splitTradeInfo(tradeMainItems[1]);
            const rank = await this._getTradeRank(tradeMainItems[1]);
            return { tradeCards, userCards, rank };
        }
    }

    static _splitTradeInfo(div) {
        return Array.from(div.querySelectorAll('a'))
            .map(link => {
                const href = link.getAttribute('href');
                const id = href.match(/^\/cards\/(\d+)\/users\/$/)[1];
                const img = link.querySelector("img");
                const dubles = !!img.getAttribute("class")?.includes("anime-cards__owned-by-user");
                return { id, dubles };
        })
    }

    static _getTradeRank(div) {
        const link = div.querySelector("a");
        const img = link.querySelector("img");
        const src = img.getAttribute("data-src");
        const rank = UrlConstructor.getRankBySrc(src);
        return rank;
    }
}