/**
 * Service for fetching cards from different sources
 */
class GetCards {
    constructor({ rank = null, user = new User() } = { rank: null, user: new User() }) {
        this.rank = rank;
        this.user = user;
        this.UrlConstructor = new UrlConstructor({ rank: this.rank, userUrl: this.user.userUrl });
    }

    static cacheService = new CacheService();

    _getCards(dom) {
        try {
            const array = dom.querySelector(".anime-cards.anime-cards--full-page");
            const childrens = Array.from(array.children);
            const cards = new CardsArray(...childrens.map(element => {
                const card = new Card(element)
                card.setLock()
                card.setRateByLock()
                card.setSrc()
                card.setVideoData()
                card.setId()
                card.setCardId()
                card.setName();
                card.setStar()
                return card
            }))
            return cards;
        } catch (error) {
            console.log(dom, error);
            return new CardsArray();
        }
    }

    async getAllCards(url) {
        const cardsList = new CardsArray();
        const dom = await FetchService.parseFetch(url)
        cardsList.push(...this._getCards(dom));
        const pageUrls = findPanel(dom);
        if (pageUrls) {
            const pagesCards = await Promise.all(
                pageUrls.map(async (url) => {
                    const dom = await FetchService.parseFetch(url);
                    return this._getCards(dom);
                })
            );
            pagesCards.forEach(cards => cardsList.push(...cards));
        }
        cardsList.forEach(card => {
            card.username = this.user.username;
            card.url = this.user.userUrl;
            card.online = this.user.online;
        });
        return cardsList;
    }

    async getInventory({ unlock = null, cache = false } = { unlock: null, cache: false }) {
        // Check if the cards are in cache
        if (cache) {
            const cards = GetCards.cacheService.get({ method: "getInventory", rank: this.rank, username: this.user.username });
            if (cards) return cards;
        }

        // Check if the user is me
        if (UrlConstructor.getMyUrl() === this.user.userUrl) {
            try {
                const cards = await GetCards.getMyCards({ rank: this.rank, unlock });

                // cache results
                cache && (GetCards.cacheService.save({ method: "getInventory", rank: this.rank, username: this.user.username, cards }));

                return cards;
            } catch (error) { 
                if (!(error instanceof InvalidRankError)) {
                    console.error(error); 
                }
            }
        }
        let cardUrl = this.UrlConstructor.inventory();
        cardUrl = this.UrlConstructor.unlock(cardUrl, unlock);
        const cards = await this.getAllCards(cardUrl)

        // cache results
        cache && (GetCards.cacheService.save({ method: "getInventory", rank: this.rank, username: this.user.username, cards }));

        return cards;
    }

    async getNeed({ cache = false } = { cache: false }) {
        // Check if the cards are in cache
        if (cache) {
            const cards = GetCards.cacheService.get({ method: "getNeed", rank: this.rank, username: this.user.username });
            if (cards) return cards;
        }

        const needCardUrl = this.UrlConstructor.need();
        const cards = await this.getAllCards(needCardUrl);

        cache && (GetCards.cacheService.save({ method: "getNeed", rank: this.rank, username: this.user.username, cards }));

        return cards;
    }

    async getTrade({ cache = false } = { cache: false }) {
        // Check if the cards are in cache
        if (cache) {
            const cards = GetCards.cacheService.get({ method: "getTrade", rank: this.rank, username: this.user.username });
            if (cards) return cards;
        }

        const tradeCardUrl = this.UrlConstructor.trade();
        const cards = await this.getAllCards(tradeCardUrl);

        cache && (GetCards.cacheService.save({ method: "getTrade", rank: this.rank, username: this.user.username, cards }));

        return cards;
    }

    async getInventoryTrade({ unlock = null, cache = false } = { unlock: null, cache: false }) {
        let [inventoryCards, tradeCards] = await Promise.all([
            this.getInventory({ unlock, cache }),
            this.getTrade({ cache }),
        ]);


        tradeCards = tradeCards.unique();

        tradeCards.forEach(tradeCard => {
            inventoryCards.forEach(inventoryCard => {
                if (tradeCard.compare(inventoryCard) && inventoryCard.lock !== "lock") {
                    inventoryCard.rate += 1;
                }
            });
        });
        return inventoryCards;
    }

    static async getByDeck({ rank = null } = { rank: null }) {
        const url = "/decks/create/"
        const dom = await FetchService.parseFetch(url);
        const nodes = dom.querySelectorAll('.card-filter-list__card');

        const cards = new CardsArray();
        nodes.forEach(element => {
            const card = new Card(element);
            card.htmlType = "deck";
            card.setId();
            card.setCardId();
            card.setSrc();
            card.setAnimeName();
            card.setRank();
            card.setStar();
            card.username = UrlConstructor.getMyName();
            card.url = UrlConstructor.getMyUrl();
            cards.push(card);
        })

        rank && cards.filter(card => card.rank === rank);

        return cards;
    }

    static async getByRemelt({ rank, unlock = null }) {
        const url = "/cards_remelt/" + UrlConstructor.params(rank, unlock);
        const dom = await FetchService.parseFetch(url);
        const cards = this._getByRemelt(dom);
        return cards;
    }

    static _getByRemelt(dom) {
        const container = dom.querySelector('.remelt__inventory');
        const nodes = container.querySelectorAll('.remelt__inventory-item');
        let cards = new CardsArray();

        nodes.forEach(element => {
            const card = new Card(element);
            card.setId();
            card.setSrc();
            card.setLock();
            card.setRateByLock();
            card.setStar();
            card.username = UrlConstructor.getMyName();
            card.url = UrlConstructor.getMyUrl();
            cards.push(card);
        });
        return cards;
    }

    static async getByShowcase({ rank = "", unlock = null, search = "" }) {
        const text = await FetchService.showcase({ rank, locked: unlock === null ? "" : (unlock) ? 0 : 1, search });
        const parser = new DOMParser();
        const dom = parser.parseFromString(text, 'text/html');

        const nodes = dom.querySelectorAll('.card-filter-list__card');
        let cards = new CardsArray();

        nodes.forEach(element => {
            const card = new Card(element);
            card.setId();
            card.setSrc();
            card.setName();
            card.setAnimeName();
            card.setRank();
            card.setStar();
            card.username = UrlConstructor.getMyName();
            card.url = UrlConstructor.getMyUrl();
            cards.push(card);
        });
        return cards;
    }

    static async getMyCards({ rank, unlock = null }) {
        const ranks = ["a", "b", "c", "d", "e"];
        if (ranks.includes(rank.toLowerCase())) {
            return await this._getMyCards(rank, unlock);
        } else {
            throw new InvalidRankError(rank);
        }
    }

    static async _getMyCards(rank, unlock = null) {
        const [remelt, deck] = await Promise.all([
            this.getByRemelt({ rank, unlock }),
            this.getByDeck({ rank })
        ]);
        this._proccessCards({ remelt, deck });
        deck.forEach(card => {
            card.transformToCard();
        });
        return deck;
    }

    static _proccessCards({ remelt, deck }) {

        const remeltMap = new Map();
        for (let i = 0; i < remelt.length; i++) {
            remeltMap.set(remelt[i].id, remelt[i]);
        }

        for (let i = 0; i < deck.length; i++) {
            const card = deck[i];
            const remeltCard = remeltMap.get(card.id);

            if (remeltCard) {
                card.lock = remeltCard.lock;
                card.rate = remeltCard.rate;
            } else {
                if (card.lock !== "star") {
                    card.lock = "trophy";
                }
            }
        }
    }

    static async getNeedCount({ id, cache = false }) {
        if (cache) {
            const count = GetCards.cacheService.get({ method: "getNeedCount", id });
            if (count !== null) return count;
        }

        const { needCount } = await this._getInfo({ id, cache });

        return needCount;
    }

    static async getTradeCount({ id, cache = false }) {
        if (cache) {
            const count = GetCards.cacheService.get({ method: "getTradeCount", id });
            if (count !== null) return count;
        }

        const { tradeCount } = await this._getInfo({ id, cache });

        return tradeCount;
    }

    static async getUsersCount({ id, unlock = false, cache = false }) {
        if (cache) {
            const count = GetCards.cacheService.get({ method: `getUsersCount${unlock ? "Unlock" : ""}`, id });
            if (count !== null) return count;
        }

        const { ownerCount } = await this._getInfo({ id, unlock, cache });

        return ownerCount;
    }

    static async _getInfo({ id, unlock = false, cache = false }) {
        const url = UrlConstructor.getCardUrl(id, unlock);
        const { ownerCount, tradeCount, needCount } = await getUsersCount(url);
        cache && (GetCards.cacheService.save({ method: `getUsersCount${unlock ? "Unlock" : ""}`, id, count: ownerCount }));
        cache && (GetCards.cacheService.save({ method: `getTradeCount`, id, count: tradeCount }));
        cache && (GetCards.cacheService.save({ method: `getNeedCount`, id, count: needCount }));
        return { ownerCount, tradeCount, needCount };
    }
}

class InvalidRankError extends Error {
    constructor(rank) {
        super(`Invalid rank: ${rank}. Allowed ranks are: a, b, c, d, e`);
        this.name = 'InvalidRankError';
        this.rank = rank;
    }
}