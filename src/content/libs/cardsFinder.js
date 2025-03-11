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

    search(name) {
        return this.userUrl + "/cards/" + this.rank + "&search=" + name;
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

    static async validateUser(userName) {
        const response = await saveFetch(UrlConstructor.getUserUrl(userName));
        if (response.status === 404) {
            return null;
        }
        const parser = new DOMParser();
        const dom = parser.parseFromString(await response.text(), "text/html");
        const user = dom.querySelector(".usp__name").firstChild.textContent.trim();
        return user;
    }

    static async getCardName(id) {
        const url = this.getCardNeedUrl(id);
        const dom = await Fetch.parseFetch(url);
        return dom.querySelector(".secondary-title.text-center a").textContent.trim();
    }

    static tradeLink(cardId, myCardId) {
        return `/cards/${cardId}/trade?mycard=${myCardId}`;
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
            card.setVideoData()
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


async function getInventoryTrade({ userUrl, userName, rank, unlock = false }) {
    const getCards = new GetCards({ userUrl, userName, rank });
    const [inventoryCards, trageCards] = await Promise.all([
        getCards.getInventory(unlock),
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

async function trade(card, tradeCard) {
    if (tradeCard.lock === "lock") {
        await tradeCard.unlock();
    }
    window.location.href = UrlConstructor.tradeLink(card.id, tradeCard.id);
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
    _rankValidation() {
        const banRanks = ["b", "c", "d", "e"];
        if (banRanks.some(rank => this.rank === rank)) return `Rank ${this.rank.toUpperCase()} is not supported in /need (too much data to load)`;
    }

    _notSupported(banRanks) {
        if (banRanks.some(rank => this.rank === rank)) return `Rank ${this.rank.toUpperCase()} is not supported`;
    }

    async need() {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        const rankAnswer = this._rankValidation();
        if (rankAnswer) return { error: rankAnswer };
        const notSupported = this._notSupported(["ass"]);
        if (notSupported) return { error: notSupported }
        await this.setCardName();
        return await this.getNeededCards();
    }

    async trade() {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        const notSupported = this._notSupported(["ass"]);
        if (notSupported) return { error: notSupported }
        await this.setCardName();
        return await this.getTradeUsersCards("trade");
    }

    async users() {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        const notSupported = this._notSupported(["ass"]);
        if (notSupported) return { error: notSupported }
        await this.setCardName();
        return await this.getTradeUsersCards("users");
    }

    async getNeededCards() {
        if (this.rank === "a") {
            this.limit = 100;
        }
        const getCards = new GetCards({ userUrl: this.userUrl, rank: this.rank });
        let [userInventoryCards, userNeededCards] = await Promise.all([
            getCards.getInventory(),
            getCards.getNeed(),
        ]);

        const userCard = getCardBySrc(userInventoryCards, this.src);

        const dom = await Fetch.parseFetch(UrlConstructor.getCardNeedUrl(this.id));
        const usersList = await getUsersList(dom, { limit: this.limit, pageLimit: this.pageLimit });

        const usersCards = await findUsersCards(usersList, user => this._checkUserCards(user, usersList.length > 75));

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
            });
        }

        if (!usersCards.length()) {
            return { error: "No cards found" };
        }

        this._setCardInfo(usersCards, usersList);
        return usersCards;
    }

    async getTradeUsersCards(mode) {
        const getCards = new GetCards({ userUrl: this.userUrl, rank: this.rank });
        const userCards = await getCards.getInventory();
        let url; 
        switch (mode) {
            case "trade":
                url = UrlConstructor.getCardTradeUrl(this.id);
                break;
            case "users":
                url = UrlConstructor.getCardUrl(this.id);
                break;
        }

        const dom = await Fetch.parseFetch(url);
        const usersList = await getUsersList(dom, {
            limit: this.limit,
            pageLimit: this.pageLimit,
        });

        const usersCards = await findUsersCards(usersList, user => getUserNeed(user, this.rank));
        const cards = this._compareCards(userCards, usersCards);
        this._setSearchLink(cards, this.name);
        await this._setTradeInfo(cards);
        this._setTradeLink(cards);

        this._filterCards(cards, 75, -1);
        this._processCards(cards);

        cards.sort();

        if (!cards.length()) {
            return { error: "No cards found" };
        }

        this._setCardInfo(cards, usersList);
        return cards;
    }

    async _checkUserCards(user, unlock = false) {
        const { userUrl, userName } = user;
        const cards = await getInventoryTrade({ userUrl, userName, rank: this.rank, unlock });
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

    _processCards(cards) {
        cards.forEach(card => {
            card.fixCard();
            card.fixLockIcon();
            card.addLink();
            card.setColorByRate();
            card.removeBorderds();
            card.removeButton();
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
        if (cards.length() > length) {
            cards.filter(card => card.rate > rate);
        }
    }

    _setSearchLink(cards, name = null) {
        cards.forEach(card => {
            const urlConstructor = new UrlConstructor({ rank: this.rank, userUrl: card.url });
            card.searchLink = urlConstructor.search(name || card.name);
        });
    }

    async _setTradeInfo(cards) {
        const users = new Set(cards.cards.map(card => card.searchLink));
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

    _setCardInfo(cards, users) {
        cards.info = {
            rank: this.rank,
            name: this.name,
            src: this.src,
            id: this.id,
            mp4: this.mp4,
            webm: this.webm,
            usersLength: users.length,
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

            else if (card.lock === "trade") {
                text = "This card is in trade";
                disabled = true;
            }
            else if (card.lock === "lock") {
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