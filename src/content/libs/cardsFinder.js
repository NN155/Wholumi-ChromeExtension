class UrlConstructor {
    constructor({ rank, userUrl }) {
        this.userUrl = userUrl;
        this.rank = `?rank=${rank}`;
    }

    static myUrl;
    static myName;
    static clubId;

    inventory() {
        return this.userUrl + '/cards/' + this.rank;
    }

    need() {
        return this.userUrl + '/cards/need/' + this.rank;
    }

    trade() {
        return this.userUrl + '/cards/trade/' + this.rank;
    }

    search(name) {
        return this.userUrl + "/cards/" + this.rank + "&search=" + name;
    }
    unlock(url, unlock = true) {
        return url += `${unlock !== null ? `&locked=${unlock ? 0 : 1}` : ""}`;
    }
    static params(rank = null, unlock = null) {
        return `?${rank ? `rank=${rank}` : ""}${unlock !== null ? `&locked=${unlock ? 0 : 1}` : ""}`;
    }

    static getMyUrl() {
        if (this.myUrl) {
            return this.myUrl;
        }
        const menu = document.querySelector(".lgn__inner")
        const urls = menu.querySelectorAll("a")
        const urlsArray = Array.from(urls);
        for (const element of urlsArray) {
            if (element.href.endsWith("/cards/")) {
                this.myUrl = element.getAttribute("href").replace("cards/", "");
                return this.myUrl;
            }
        }
    }

    static getMyName() {
        if (this.myName) {
            return this.myName;
        }
        const myUrl = this.getMyUrl();
        this.myName = myUrl.match(/\/user\/([^/]+)\//)?.[1];
        return this.myName;
    }

    static getUserUrl(userName) {
        return `/user/${userName}/`;
    }

    static isMyPage(url = window.location.href) {
        const name = this.getMyName().toLowerCase();
        url = url.toLowerCase();

        const regex = new RegExp(`/user/(${name})($|/)`, 'i');
        return regex.test(url);
    }

    static getCardRank(url = window.location.href) {
        url = url.toLowerCase();
        const regex = /[?&]rank=([a-zA-Z])/;
        const match = url.match(regex);
        return match ? match[1].toLowerCase() : null;
    }

    static getCardUrl(cardId, unlocked = false) {
        return `/cards/${cardId}/users/` + (unlocked ? "?unlocked=1" : "");
    }

    static getCardNeedUrl(cardId) {
        return `/cards/${cardId}/users/need/`;
    }

    static getCardTradeUrl(cardId) {
        return `/cards/${cardId}/users/trade/`;
    }

    static getClubId() {
        if (this.clubId) {
            return this.clubId;
        }
        const menu = document.querySelector(".lgn__inner")
        const urls = menu.querySelectorAll("a")
        const urlsArray = Array.from(urls);
        for (const element of urlsArray) {
            if (element.href.includes("/clubs/")) {
                this.clubId = element.href.match(/\/clubs\/(\d+)\//)?.[1];
                return this.clubId;
            }
        }
    }

    static getCardId(url) {
        return url.match(/\/cards\/(\d+)\//)?.[1];
    }

    static async validateUser(userName) {
        const response = await saveFetch(UrlConstructor.getUserUrl(userName));
        if (response.status === 404) {
            return null;
        }
        const parser = new DOMParser();
        const dom = parser.parseFromString(await response.text(), "text/html");
        const user = dom.querySelector(".usn__name h1").textContent.trim();
        return user;
    }

    static async getCardName(id) {
        const url = this.getCardNeedUrl(id);
        const dom = await Fetch.parseFetch(url);
        return dom.querySelector(".secondary-title.text-center a").textContent.trim();
    }

    static tradeLink(wantedCardId, tradedCardId = null) {
        return `/cards/${wantedCardId}/trade${tradedCardId ? `?mycard=${tradedCardId}` : ""}`;
    }

    static getSentLink(id = null) {
        return `/trades/offers/${id ? `${id}/` : ""}`;
    }

    static getOfferLink(id = null) {
        return `/trades/${id ? `${id}/` : ""}`;
    }

    static getAnimeId(url) {
        const match = url.match(/\/aniserials\/video\/[^\/]+\/(\d+)-/);
        const id = match ? match[1] : null;
        return id;
    }

    static getRankBySrc(src) {
        const match = src.match(/\/uploads\/cards_image\/\d+\/([a-z])\/[^/]+$/);
        return match ? match[1].toLowerCase() : null;
    }
}

class GetCards {
    constructor({ rank = null, user } = { rank: null, user: new User() }) {
        this.rank = rank;
        this.user = user;
        this.UrlConstructor = new UrlConstructor({ rank: this.rank, userUrl: this.user.userUrl });
    }

    static cash = {};

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
                return card
            }))
            return cards;
        } catch (error) {
            console.log(dom);
            return new CardsArray();
        }

    }
    async getAllCards(url) {
        const cardsList = new CardsArray();
        const dom = await Fetch.parseFetch(url)
        cardsList.push(...this._getCards(dom));
        const pageUrls = findPanel(dom);
        if (pageUrls) {
            const pagesCards = await Promise.all(
                pageUrls.map(async (url) => {
                    const dom = await Fetch.parseFetch(url);
                    return this._getCards(dom);
                })
            );
            pagesCards.forEach(cards => cardsList.push(...cards));
        }
        cardsList.forEach(card => {
            card.userName = this.user.userName;
            card.url = this.user.userUrl;
            card.online = this.user.online;
        });
        return cardsList;
    }

    async getInventory({ unlock = null, cash = false } = { unlock: null, cash: false }) {
        // Check if the cards are in cache
        if (cash) {
            const cards = GetCards.getCash({ method: "getInventory", rank: this.rank, userName: this.user.userName })
            if (cards) return cards;
        }

        // Check if the user is me
        if (UrlConstructor.getMyUrl() === this.user.userUrl) {
            try {
                const cards = await GetCards.getMyCards({ rank: this.rank, unlock });

                // cash results
                cash && (GetCards.saveCash({ method: "getInventory", rank: this.rank, userName: this.user.userName, cards }));

                return cards;
            } catch (error) { }
        }
        let cardUrl = this.UrlConstructor.inventory();
        cardUrl = this.UrlConstructor.unlock(cardUrl, unlock);
        const cards = await this.getAllCards(cardUrl)

        // cash results
        cash && (GetCards.saveCash({ method: "getInventory", rank: this.rank, userName: this.user.userName, cards }));

        return cards;
    }

    async getNeed({ cash = false } = { cash: false }) {
        // Check if the cards are in cache
        if (cash) {
            const cards = GetCards.getCash({ method: "getNeed", rank: this.rank, userName: this.user.userName })
            if (cards) return cards;
        }

        const needCardUrl = this.UrlConstructor.need();
        const cards = await this.getAllCards(needCardUrl);

        cash && (GetCards.saveCash({ method: "getNeed", rank: this.rank, userName: this.user.userName, cards }));

        return cards;
    }

    async getTrade({ cash = false } = { cash: false }) {
        // Check if the cards are in cache
        if (cash) {
            const cards = GetCards.getCash({ method: "getTrade", rank: this.rank, userName: this.user.userName })
            if (cards) return cards;
        }

        const tradeCardUrl = this.UrlConstructor.trade();
        const cards = await this.getAllCards(tradeCardUrl);

        cash && (GetCards.saveCash({ method: "getTrade", rank: this.rank, userName: this.user.userName, cards }));

        return cards;
    }

    async getInventoryTrade({ unlock = null, cash = false } = { unlock: null, cash: false }) {
        const [inventoryCards, tradeCards] = await Promise.all([
            this.getInventory({ unlock, cash }),
            this.getTrade({ cash }),
        ]);
        tradeCards.forEach(tradeCard => {
            inventoryCards.forEach(inventoryCard => {
                if (tradeCard.cardId === inventoryCard.cardId && inventoryCard.lock !== "lock") {
                    inventoryCard.rate += 1;
                }
            });
        });
        return inventoryCards;
    }

    static async getByRemelt({ rank, unlock = null }) {
        const url = "/cards_remelt/" + UrlConstructor.params(rank, unlock);
        const dom = await Fetch.parseFetch(url);
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
            card.userName = UrlConstructor.getMyName();
            card.url = UrlConstructor.getMyUrl();
            cards.push(card);
        });
        return cards;
    }

    static async getByShowcase({ rank = "", unlock = null, search = "" }) {
        const text = await Fetch.showcase({ rank, locked: unlock === null ? "" : (unlock) ? 0 : 1, search });
        const parser = new DOMParser();
        const dom = parser.parseFromString(text, 'text/html');

        const nodes = dom.querySelectorAll('.card-filter-list__card');
        let cards = new CardsArray();

        nodes.forEach(element => {
            const card = new Card(element);
            card.setId();
            card.setCardId();
            card.setSrc();
            card.setName();
            card.setAnimeName();
            card.setRank();
            card.userName = UrlConstructor.getMyName();
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
            throw new Error("Wrong rank");
        }
    }

    static async _getMyCards(rank, unlock = null) {
        const [showcase, remelt] = await Promise.all([
            this.getByShowcase({ rank, unlock }),
            this.getByRemelt({ rank, unlock })
        ]);
        this._proccessCards(showcase, remelt);
        showcase.forEach(card => {
            card.transformToCard();
        });
        return showcase;
    }
    static _proccessCards(showcase, remelt) {
        showcase.forEach(card => {
            const remeltCard = remelt.find(remeltCard => remeltCard.id === card.id);
            if (remeltCard) {
                card.lock = remeltCard.lock;
                card.rate = remeltCard.rate;
            } else {
                card.lock = "trophy";
            }
        });
    }

    static saveCash({ method, rank, userName, cards, count, id }) {
        if (!this.cash[method]) {
            this.cash[method] = {};
        }

        if (rank) {
            if (!this.cash[method][rank]) {
                this.cash[method][rank] = {};
            }
            this.cash[method][rank][userName] = cards.clone();
            return;
        } else if (id) {
            this.cash[method][id] = count;
            return;
        }
    }

    static getCash({ method, rank, userName, id }) {
        if (this.cash[method]) {
            if (rank) {
                if (this.cash[method][rank] && this.cash[method][rank][userName]) {
                    return this.cash[method][rank][userName].clone();
                }
            } else if (id) {
                if (this.cash[method][id]) {
                    return this.cash[method][id];
                }
            }
        }
        return null;
    }

    static deleteFromCash({ method, rank, userName, cardId, id }) {
        if (this.cash[method]) {
            if (rank) {
                if (this.cash[method][rank] && this.cash[method][rank][userName]) {
                    if (id) this.cash[method][rank][userName].filter(card => card.id !== id);
                    else if (cardId) this.cash[method][rank][userName].filter(card => card.cardId !== cardId);
                    else delete this.cash[method][rank][userName];
                }
            }
        }
    }

    static async getNeedCount({ id, cash = false }) {
        if (cash) {
            const count = GetCards.getCash({ method: "getNeedCount", id });
            if (count !== null) return count;
        }

        const url = UrlConstructor.getCardNeedUrl(id);
        const usersList = await getUsersList(url);
        const count = usersList.length;

        cash && (GetCards.saveCash({ method: "getNeedCount", id, count }));

        return count;
    }
}

async function findUsersCards(usersList, callBack) {
    const usersCards = new CardsArray();
    const userCardsPromises = usersList.map(callBack);
    const userCardsResults = await Promise.all(userCardsPromises);
    userCardsResults.forEach(data => {
        usersCards.push(...data);
    });
    return usersCards;
}

function getCardBySrc(cards, src) {
    let card;
    card = cards.find(card => card.src === src && card.lock === "unlock");
    if (card) {
        return card;
    }
    card = cards.find(card => card.src === src && card.lock === "lock");
    return card;
}

async function trade(card, tradeCard) {
    if (tradeCard.lock === "lock") {
        await tradeCard.unlockCard();
    }
    window.location.href = UrlConstructor.tradeLink(card.id, tradeCard.id);
}

class CardsFinder {
    constructor({ id, userName, limit = 3000, pageLimit = 15 }) {
        this.id = id;
        this.userName = userName;
        this.userUrl;
        this.limit = limit;
        this.pageLimit = pageLimit;
        this.src = null;
        this.rank = null;
        this.userExist = false;
        this.mp4 = null;
        this.webm = null;
    }

    async setCardData() {
        const cardUrl = UrlConstructor.getCardUrl(this.id);
        const dom = await Fetch.parseFetch(cardUrl);
        try {
            const cardInfo = getCardInfo(dom);
            this.rank = cardInfo.rank;
            this.src = cardInfo.src;
            this.mp4 = cardInfo.mp4;
            this.webm = cardInfo.webm;
        } catch (error) { }
    }
    async checkUserExistence() {
        this.userName = await UrlConstructor.validateUser(this.userName);
        this.userUrl = UrlConstructor.getUserUrl(this.userName);
        this.userExist = this.userName !== null
    }

    async setData() {
        await Promise.all([this.setCardData(), this.checkUserExistence()]);
    }

    async setCardName() {
        this.name = await UrlConstructor.getCardName(this.id);
    };
    verifyData() {
        if (!this.userExist) return "Wrong user name";
        if (!this.rank && (!this.src || this.mp4)) return "Wrong card id";
    }

    async need({ filter, cash } = {}) {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        await this.setCardName();
        return await this.getNeededCards({ filter, cash });
    }

    async trade({ filter, cash, online, needCount } = {}) {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        await this.setCardName();
        return await this.getTradeUsersCards("trade", { filter, cash, online, needCount });
    }

    async users({ filter, cash, online, needCount } = {}) {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        await this.setCardName();
        return await this.getTradeUsersCards("users", { filter, cash, online, needCount });
    }

    async getNeededCards({ filter = false, cash = false } = { filter: false, cash: false }) {
        const getCards = new GetCards({ user: new User({ userUrl: this.userUrl, userName: this.userName }), rank: this.rank });
        let [userInventoryCards, userNeededCards] = await Promise.all([
            getCards.getInventory({ unlock: filter ? true : null, cash }),
            getCards.getNeed({ cash }),
        ]);

        const userCard = getCardBySrc(userInventoryCards, this.src);

        const url = UrlConstructor.getCardNeedUrl(this.id);
        const usersList = await getUsersList(url, { limit: this.limit, pageLimit: this.pageLimit });

        const usersCards = await findUsersCards(usersList, async user => {
            const { userUrl, userName } = user;
            const getCard = new GetCards({ user: new User({ userUrl, userName }), rank: this.rank });
            const unlock = filter ? true : (usersList.length > 75 ? true : null);
            const cards = await getCard.getInventoryTrade({ unlock, cash });
            return cards;
        });

        this._processCards(usersCards);

        this._addOrangeBorder(usersCards, userInventoryCards);
        this._upPriority(usersCards, userNeededCards);

        this._filterCards(usersCards, 200, 0);

        usersCards.sort();

        this._setSearchLink(usersCards);

        if (userCard) {
            usersCards.forEach(card => {
                card.tradeLink = UrlConstructor.tradeLink(card.id, userCard.id);
                card.tradeId = userCard.id;
                card.tradeLock = userCard.lock;
                card.tradeCardId = userCard.cardId;
            });
        }

        if (!usersCards.length) {
            return { error: "No cards found" };
        }

        this._setCardInfo({ cards: usersCards, users: usersList });
        return usersCards;
    }

    async getTradeUsersCards(mode, { filter = false, cash = false, online = false, needCount = false } = { filter: false, cash: false, online: false, needCount: false }) {
        const getCards = new GetCards({ user: new User({ userUrl: this.userUrl, userName: this.userName }), rank: this.rank });
        const userCards = await getCards.getInventory({ unlock: filter ? true : null, cash });
        let url;
        switch (mode) {
            case "trade":
                url = UrlConstructor.getCardTradeUrl(this.id);
                break;
            case "users":
                url = UrlConstructor.getCardUrl(this.id, true);
                break;
        }

        const usersList = await getUsersList(url, {
            limit: this.limit,
            pageLimit: this.pageLimit,
            filterLock: filter,
            filterOnline: online,
        });

        const usersCards = await findUsersCards(usersList, async user => {
            const { userUrl, userName } = user;
            const getCards = new GetCards({ user: new User({ userUrl, userName }), rank: this.rank });
            const cards = await getCards.getNeed({ cash });
            return cards;
        });

        const cards = this._compareCards(userCards, usersCards);

        this._setSearchLink(cards, this.name);
        await this._setTradeInfo(cards);
        this._setTradeLink(cards);

        filter ? this._filterNotAvailable(cards) : this._filterCards(cards, 75, -1);

        this._processCards(cards, true);

        
        if (!cards.length) return { error: "No cards found" };
        
        
        if (needCount) {
            const [_, cardNeedCount] = await Promise.all([
                this._needCount(cards, { cash }),
                GetCards.getNeedCount({ id: this.id, cash })
            ]);
            this._setNeedCount({ cards, needCount: cardNeedCount });
        }

        this._setCardInfo({ cards, users: usersList} );
        
        cards.sort();

        return cards;
    }

    _upPriority(otherCards, userNeededCards) {
        otherCards.forEach(otherCard => {
            if (userNeededCards.find(userCard => userCard.cardId === otherCard.cardId)) {
                otherCard.sortPriority = 1;
                otherCard.setBorder(globalColors.purple);
            }
        })
    }

    _addOrangeBorder(otherCards, userCards) {
        otherCards.forEach(otherCard => {
            otherCard.removeBorderds();
            if (userCards.find(userCard => userCard.cardId === otherCard.cardId)) {
                otherCard.dubles = 1;
                otherCard.setBorder(globalColors.orange);
            }
        })
    }

    _processCards(cards, addIcon = false) {
        cards.forEach(card => {
            card.fixCard();
            addIcon && card.addLockIcon(card.tradeLock);
            card.fixLockIcon();
            card.addLink();
            card.setColorByRate();
            card.removeBorderds();
            card.removeButton();
        });
    }

    async _needCount(cards, { cash = false } = { cash: false }) {
        const setCards = new Set(cards.map(card => card.cardId));

        const promises = Array.from(setCards).map(async cardId => {
            const count = await GetCards.getNeedCount({ id: cardId, cash });
            return { cardId, count };
        });

        const results = await Promise.all(promises);

        const countsMap = new Map();
        results.forEach(({ cardId, count }) => {
            countsMap.set(cardId, count);
        });

        cards.forEach(card => {
            card.needCount = countsMap.get(card.cardId) || 0;
        });
    }

    _compareCards(userCards, otherCards) {
        otherCards.filter(otherCard => {
            const copyCards = new CardsArray();
            copyCards.push(...userCards);
            copyCards.filter(userCard => userCard.cardId === otherCard.cardId);

            let userCard;
            userCard = copyCards.find(userCard => userCard.lock === "unlock");
            userCard = userCard || copyCards.find(userCard => userCard.lock === "lock");
            userCard = userCard || copyCards.find(userCard => userCard.lock === "trade");
            userCard = userCard || copyCards.find(userCard => userCard.lock === "trophy");
            if (userCard) {
                otherCard.rate = otherCard.rate < 0 ? otherCard.rate : userCard.rate;
                otherCard.tradeId = userCard.id;
                otherCard.tradeLock = userCard.lock;
                return userCard
            }
        })
        return otherCards;
    }

    _filterCards(cards, length = 75, rate = 0) {
        if (cards.length > length) {
            cards.filter(card => card.rate > rate);
        }
    }

    _filterNotAvailable(cards) {
        cards.filter(card => card.rate > 0.5 && card.rate !== 1.5);
    }

    _setSearchLink(cards, name = null) {
        cards.forEach(card => {
            const urlConstructor = new UrlConstructor({ rank: this.rank, userUrl: card.url });
            card.searchLink = urlConstructor.search(name || card.name);
        });
    }

    async _setTradeInfo(cards) {
        const users = new Set(cards.map(card => card.searchLink));
        const results = {};
        await Promise.all(
            Array.from(users).map(async searchLink => {
                const getCards = new GetCards();
                const cards = await getCards.getAllCards(searchLink);
                cards.filter(card => card.cardId == this.id);
                let card;
                card = cards.find(card => card.lock === "unlock");
                card = card || cards.find(card => card.lock === "trade");
                card = card || cards.find(card => card.lock === "lock");
                card = card || cards.find(card => card.lock === "trophy");
                results[searchLink] = card;
            })
        );

        cards.forEach(card => {
            const anotherCard = results[card.searchLink];

            if (anotherCard) {
                card.id = anotherCard.id;
                card.lock = anotherCard.lock;
                if (card.lock !== "unlock") {
                    card.rate = -1;
                }
            }
        });
    }


    _setTradeLink(cards) {
        cards.forEach(card => {
            if (card.id && card.tradeId && card.lock === "unlock") {
                card.tradeLink = UrlConstructor.tradeLink(card.id, card.tradeId);
            }
        });
    }

    _setCardInfo({ cards, users }) {
        cards.info = {
            ...cards.info,
            rank: this.rank,
            name: this.name,
            src: this.src,
            id: this.id,
            mp4: this.mp4,
            webm: this.webm,
            usersLength: users.length,
        }
    }

    _setNeedCount({cards, needCount}) {
        cards.info = {
            ...cards.info,
            needCount: needCount,
        }
    }
}

function changeCards(cards) {
    cards.forEach(card => {
        card.addEventListener('click', async () => {
            let text;
            let disabled = false;

            if (!card.tradeId) {
                text = "Your card is not found";
                disabled = true;
            }

            else if (card.tradeLock === "trade") {
                text = "Your card is in trade";
                disabled = true;
            }

            else if (card.tradeLock === "trophy") {
                text = "Your card is locked";
                disabled = true;
            }

            else if (card.lock === "trade") {
                text = "This card is in trade";
                disabled = true;
            }
            else if (card.lock === "lock" || card.lock === "trophy") {
                text = "This card is locked";
                disabled = true;
            }

            else {
                text = `${card.tradeLock === "lock" ? "Unlock and " : ""}Trade`
            }
            const tradeCard = new Card()
            tradeCard.id = card.tradeId;
            tradeCard.lock = card.tradeLock;

            const button = new Button({
                disabled,
                text,
                onClick: async () => {
                    await trade(card, tradeCard);
                }
            });

            await button.asyncPlace(".anime-cards__controls")
        })
    })
}

async function tradeHelper(wantedCardId, tradedCardsIds) {
    try {
        const dom = await Fetch.parseFetch(UrlConstructor.tradeLink(wantedCardId));
        const container = dom.querySelector(".cards--container");
        const receiverId = container.getAttribute("data-receiver-id");
        const cardId = container.getAttribute("data-original-id");
        const response = await Fetch.trade({ receiverId, cardId, tradeId: wantedCardId, ids: tradedCardsIds });
        if (response.error) return {...response, success: false};
        if (response.html) return {...response, success: true};
        return {success: false, error: "Without html"}
    }
    catch (error) {
        console.log(error);
        return { error: "Error in trade", success: false };
    }
} 