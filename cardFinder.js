class UrlConstructor {
    constructor({rank, userUrl}) {
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
        return this.userUrl + '/cards/trade/' + this.rank ;
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
}

class GetCards {
    constructor({rank, userUrl, userName}) {
        this.userUrl = userUrl;
        this.userName = userName;
        this.rank = rank;
        this.UrlConstructor = new UrlConstructor({rank: this.rank, userUrl: this.userUrl});
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
            return card
        }))
        return cards
    }
    async _getAllCards(url) {
        const cardsList = new CardsArray();
        const dom = await parseFetch(url)
        cardsList.push(...this._getCards(dom));
        const pageUrls = findPanel(dom);
        if (pageUrls) {
            const pagesCards = await Promise.all(
                pageUrls.map(async (url) => {
                    const dom = await parseFetch(url);
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
    async getInventory() {
        const cardUrl = this.UrlConstructor.inventory();
        return await this._getAllCards(cardUrl);
    }

    async getNeed() {
        const needCardUrl = this.UrlConstructor.need();
        return await this._getAllCards(needCardUrl);
    }

    async getTrade() {
        const tradeCardUrl = this.UrlConstructor.trade();
        return await this._getAllCards(tradeCardUrl);
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