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
}

class GetCards {
    constructor({ rank, userUrl, userName }) {
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