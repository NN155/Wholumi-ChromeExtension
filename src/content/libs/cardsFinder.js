class UrlConstructor {
    constructor({ rank, userUrl }) {
        this.userUrl = userUrl;
        this.rank = `?rank=${rank}`;
    }

    inventory() {
        return this.userUrl + '/cards/' + this.rank;
    }

    need() {
        return this.userUrl + '/cards/need/' + this.rank;
    }

    trade() {
        return this.userUrl + '/cards/trade/' + this.rank;
    }

    unlock(url) {
        return url += "&locked=0";
    }

    static getMyUrl() {
        const menu = document.querySelector(".login__content.login__menu")
        const urls = menu.querySelectorAll("a")
        const urlsArray = Array.from(urls);
        for (const element of urlsArray) {
            if (element.href.endsWith("/cards/")) {
                return element.href.replace("/cards/", "");
            }
        }
    }

    static getMyName() {
        const menu = document.querySelector(".login__content.login__menu")
        const urls = menu.querySelectorAll("a")

        const urlsArray = Array.from(urls);
        for (const element of urlsArray) {
            if (element.href.endsWith("/cards/")) {
                return element.href.match(/\/user\/([^/]+)\//)?.[1];
            }
        }
    }

    static getUserUrl(userName) {
        const url = this.getMyUrl();
        return url.replace(/\/user\/[^/]+/, `/user/${userName}`);
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

    static getCardUrl(cardId) {
        return `/cards/${cardId}/users/`;
    }

    static getCardNeedUrl(cardId) {
        return `/cards/${cardId}/users/need/`;
    }

    static getCardTradeUrl(cardId) {
        return `/cards/${cardId}/users/trade/`;
    }

    static getClubId() {
        const menu = document.querySelector(".login__content.login__menu")
        const urls = menu.querySelectorAll("a")
        const urlsArray = Array.from(urls);
        for (const element of urlsArray) {
            if (element.href.includes("/clubs/")) {
                return element.href.match(/\/clubs\/(\d+)\//)?.[1];
            }
        }
    }

    static getCardId(url) {
        return url.match(/\/cards\/(\d+)\//)?.[1];
    }
}

class GetCards {
    constructor({ rank = null, userUrl = null, userName = null } = { rank: null, userUrl: null, userName: null }) {
        this.userUrl = userUrl;
        this.userName = userName;
        this.rank = rank;
        this.UrlConstructor = new UrlConstructor({ rank: this.rank, userUrl: this.userUrl });
    }
    _getCards(dom) {
        const array = dom.querySelector(".anime-cards.anime-cards--full-page");
        const childrens = Array.from(array.children);
        const cards = new CardsArray(childrens.map(element => {
            const card = new Card(element)
            card.setLock()
            card.setRateByLock()
            card.setSrc()
            card.setId()
            card.setCardId()
            card.setName();
            return card
        }))
        return cards
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
            card.userName = this.userName;
            card.url = this.userUrl;
        });
        return cardsList;
    }

    async getInventory(unlock = false) {
        let cardUrl = this.UrlConstructor.inventory();
        if (unlock) {
            cardUrl = this.UrlConstructor.unlock(cardUrl);
        }
        return await this.getAllCards(cardUrl);
    }

    async getNeed() {
        const needCardUrl = this.UrlConstructor.need();
        return await this.getAllCards(needCardUrl);
    }

    async getTrade() {
        const tradeCardUrl = this.UrlConstructor.trade();
        return await this.getAllCards(tradeCardUrl);
    }
}


async function getInventoryTrade({ userUrl, userName, rank }) {
    const getCards = new GetCards({ userUrl, userName, rank });
    const [inventoryCards, trageCards] = await Promise.all([
        getCards.getInventory(),
        getCards.getTrade()
    ]);
    trageCards.forEach(tradeCards => {
        inventoryCards.forEach(inventoryCard => {
            if (tradeCards.src === inventoryCard.src && inventoryCard.lock !== "lock") {
                inventoryCard.rate += 1;
            }
        });
    });
    return inventoryCards;
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

async function trade(card, myCard) {
    if (myCard.lock === "lock") {
        await myCard.unlock();
    }
    window.location.href = `/cards/${card.id}/trade?mycard=${myCard.id}`;
}

async function compareCards(hostCards, AnotherCards) {
    AnotherCards.filter(card => {
        const myCard = hostCards.find(myCard => myCard.src === card.src)
        if (myCard)
            card.rate = myCard.rate;
        return myCard;
    })
    return AnotherCards;
}

async function getUserNeed(user, rank = "s") {
    const { userUrl, userName } = user;
    const getCards = new GetCards({ userUrl, userName, rank });
    const cards = await getCards.getNeed();
    return cards;
}

class CardsFinder {
    constructor({ id, userName, limit = 3000, pageLimit = 15 }) {
        this.id = id;
        this.userName = userName;
        this.userUrl = UrlConstructor.getUserUrl(userName);
        this.limit = limit;
        this.pageLimit = pageLimit;
        this.src = null;
        this.rank = null;
        this.userExist = false;
    }

    async setCardData() {
        const cardUrl = UrlConstructor.getCardUrl(this.id);
        const dom = await Fetch.parseFetch(cardUrl);
        let rank, src;
        try {
            const cardInfo = getCardInfo(dom);
            rank = cardInfo.rank;
            src = cardInfo.src;
        } catch (error) {}

        this.src = src;
        this.rank = rank;
    }
    async checkUserExistence() {
        const response = await saveFetch(this.userUrl);
        this.userExist = response.status !== 404;
    }

    async setData() {
        await Promise.all([this.setCardData(), this.checkUserExistence()]);
    }

    verifyData() {
        if (!this.userExist) throw new Error("User not found");
        if (!this.rank && !this.src) throw new Error("Card not found");
    }

    async getNeededCards() {
        const getCards = new GetCards({ userUrl: this.userUrl, rank: this.rank });
        let [userInventoryCards, userNeededCards] = await Promise.all([
            getCards.getInventory(),
            getCards.getNeed()
        ]);

        const userCard = getCardBySrc(userInventoryCards, this.src);

        const dom = await Fetch.parseFetch(UrlConstructor.getCardNeedUrl(this.id));
        const usersList = await getUsersList(dom, { limit: this.limit, pageLimit: this.pageLimit });
        const usersCards = await findUsersCards(usersList, user => this._checkUserCards(user, this.rank));

        this._processCards(cards);

        this._addOrangeBorder(usersCards, userInventoryCards);
        this._upPriority(usersCards, userNeededCards);

        if (usersCards.length() > 150) {
            usersCards.filter(card => card.rate > 0);
        }
        usersCards.sort();
        usersCards.userCard = userCard;
        return usersCards;
    }

    async getTradedCards() {
        const getCards = new GetCards({userUrl: this.userUrl, rank: this.rank});
        const userCards = await getCards.getInventory();

        const dom = await Fetch.parseFetch(UrlConstructor.getCardTradeUrl(this.id));
        const usersList = await getUsersList(dom, {
            limit:  this.limit, 
            pageLimit: this.pageLimit,
        });

        const usersCards = await findUsersCards(usersList, user => getUserNeed(user, this.rank));
        const cards = await this._compareCards(userCards, usersCards);
        this._processCards(cards);

        if (cards.length() > 75) {
            cards.filter(card => card.rate > 0);
        }
        
        cards.sort();
        cards.userCards = userCards;

        return cards;
    }


    async need() {
        await this.setData();
        try {
            this.validateData();
            return await this.getNeededCards();
        } catch (error) {
            return { error };
        }
    }

    async trade() {
        await this.setData();
        try {
            this.validateData();
            return await this.getTradedCards();
        } catch (error) {
            return { error };
        }
    }

    async _compareCards(userCards, otherCards) {
        otherCards.filter(otherCard => {
            const userCard = userCards.find(userCard => userCard.cardId === otherCard.cardId)
            if (userCard) otherCard.rate = userCard.rate;
            return userCard;
        })
        return otherCards;
    }

    async _checkUserCards(user) {
        const { userUrl, userName } = user;
        const cards = await getInventoryTrade({ userUrl, userName, rank: this.rank });
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
                otherCard.setBorder(globalColors.orange);
            }
        })
    }

    _processCards(cards) {
        cards.forEach(card => {
            card.fixCard();
            card.fixLockIcon();
            card.addLink();
            card.setColorByRate();
            card.removeBorderds();
        });
    }

    async getUsersCards() {
        const userCards = await getInventoryTrade({userUrl: this.userUrl, rank: this.rank});

        const dom = await Fetch.parseFetch(UrlConstructor.getCardUrl(this.id));
        const usersList = await getUsersList(dom, {
            limit: this.limit, 
            pageLimit: this.pageLimit,
        });

        const usersCards = await findUsersCards(usersList, user => checkUserCards(user, this.rank));
        const cards = await this._compareUsersCards(userCards, usersCards);

        cards.forEach(card => {
            card.fixCard();
            card.addLockIcon();
            card.fixLockIcon();
            card.addLink();
            card.setColorByRate();
            card.removeBorderds();
            card.removeButton();
        });

        if (cards.length() > 75) {
            cards.filter(card => card.rate > 0);
        }
        cards.sort();

        cards.userCards = userCards;

        return cards
    }

    async users() {
        await this.setData();
        try {
            this.verifyData();
            return await this.getUsersCards();
        } catch (error) {
            return { error };
        }
    }
    _compareUsersCards(userCards, otherCards) {
        otherCards.filter(otherCard => {
            const userCard = userCards.find(userCard => userCard.src === otherCard.src)
            if (userCard) {
                otherCard.rate = otherCard.rate < 0 ? otherCard.rate : userCard.rate;
                otherCard.lock = userCard.lock;
                return userCard
            }
        })
        return otherCards;
    }
}