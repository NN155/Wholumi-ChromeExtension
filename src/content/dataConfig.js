window.addEventListener("update-data-config", async (event) => {
    let data;
    switch (event.detail.key) {
        case "packInventory":
            data = await updateInventoryInfo();
            break;
        case "siteInventory":
            data = await updateSiteInventory();
            break;
        case "openedInventory":
            data = await updateOpenedInventory();
            break;
        case "cards-data":
            data = await getCardsGraphInfo(event.detail.rank);
            break;
    }
    await ExtensionConfig.setConfig("dataConfig", { [event.detail.saveAs || event.detail.key]: data });
    const newEvent = new CustomEvent(event.detail.event, {
        detail: {
            id: event.detail.id,
        },
    });

    window.dispatchEvent(newEvent);
});

async function updateInventoryInfo() {
    const dom = await FetchService.parseFetch("/decks/create/");

    const container = dom.querySelector('.card-filter-list__items');

    const cards = new Set();

    container.querySelectorAll('.card-filter-list__card').forEach(item => {
        const dataId = item.getAttribute("data-id");
        if (dataId) {
            cards.add(dataId);
        }
    });

    return [...cards];
}

async function updateSiteInventory() {
    const cards = await getSiteInventory();
    for (const rank in cards) {
        const data = [];
        cards[rank].forEach(card => {
            data.push({ id: card.cardId, name: card.name, image: card.src, video_webm: card.webm, video_mp4: card.mp4, owned: card.owned });
        });
        cards[rank] = data;
    }
    return cards;
}

async function getSiteInventory() {
    const ranks = ["ass", "s", "a", "b", "c", "d", "e"];
    const baseUrl = "/cards/?rank=";

    const cardsPromises = ranks.map(rank => {
        const cardInstance = new GetCards();
        return cardInstance.getAllCards(`${baseUrl}${rank}`);
    });

    const [ass, s, a, b, c, d, e] = await Promise.all(cardsPromises);
    const cards = { ass, s, a, b, c, d, e };
    return cards
}

async function updateOpenedInventory() {
    const myUrl = UrlConstructor.getMyUrl();
    const ranks = ["c", "d", "e"]
    const cards = new CardsArray();
    await Promise.all(
        ranks.map(async (rank) => {
            const my = new GetCards({ user: new User({userUrl: myUrl}), rank });
            const myCards = await my.getInventory({unlock: true});
            cards.push(...myCards);
        })
    );
    cards.filter(card => card.lock !== "trade");
    const cardsHash = new CardsHash();
    cards.forEach(card => cardsHash.add(card));
    return cardsHash.hash;
}

class GraphInfo {
    constructor(rank) {
        this.cardsList;
        this.data;
        this.rank = rank;
        this.usersList;
        this.adjList = {};
    }


    async getData() {
        await this.getCardsList();
        this.data = {};
        await Promise.all(this.cardsList.map(async card => {
            this.data[card.cardId] = {...await this.getCardInfo(card.cardId), src: card.src};
        }));
    }

    async getCardsList() {
        const baseUrl = "/cards/?rank=";
        const cardInstance = new GetCards();
        const cards = await cardInstance.getAllCards(`${baseUrl}${this.rank}`);
        this.cardsList = cards;
    }

    async getCardInfo(id) {
        const urls = [UrlConstructor.getCardNeedUrl(id), UrlConstructor.getCardTradeUrl(id)];
        const [need, trade] = await Promise.all(urls.map(async url => {
            return await getUsersList(url, { limit: 10000, pageLimit: 30 });
        }));
        return { need: need, trade: trade };
    }

    createUsersData() {
        this.usersList = new UsersList();
        for (const id in this.data) {
            for (const user of this.data[id].need) {
                const { userUrl: url, username: name } = user;
                this.usersList.need({ name, url, id });
            }
            for (const user of this.data[id].trade) {
                const { userUrl: url, username: name } = user;
                this.usersList.trade({ name, url, id });
            }
        }
    }
    buildAdjList() {
        for (let user in this.usersList.users) {
            const {name, need, trade} = this.usersList.users[user];
            for (const needID of need) {
                if (!this.adjList[needID]) {
                    this.adjList[needID] = { 
                        cards: {}, 
                        popularity: this.data[needID].need.length, 
                        availability: this.data[needID].trade.length, 
                        src: this.data[needID].src 
                    };
                }
                for (const tradeID of trade) {
                    if (!this.adjList[needID].cards[tradeID]) {
                        this.adjList[needID].cards[tradeID] = [];
                    }
                    this.adjList[needID].cards[tradeID].push(name);
                }
            }
        }
    }
}

class UsersList {
    constructor() {
        this.users = {};
    }

    need({ name, url, id }) {
        this._checkUser({ name, url });
        this.users[name].need.add(id);
    }

    trade({ name, url, id }) {
        this._checkUser({ name, url });
        this.users[name].trade.add(id);
    }

    _checkUser({ name, url }) {
        if (!this.users[name]) {
            this.users[name] = { name, url, need: new Set(), trade: new Set() };
        }
    }
}
async function getCardsGraphInfo(rank) {
    const graph = new GraphInfo(rank);
    await graph.getData();
    graph.createUsersData();
    graph.buildAdjList();

    return graph.adjList;
}