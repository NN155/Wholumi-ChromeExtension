let autoConfirm = false;
let autoCancel = false;
let autoMoreWanted = false;
let working = false;
let memory = [];

const ranks = ['a', 'b', 'c', 'd', 'e'];

async function checkPage() {
    if (working) {
        memory = [];
        return;
    }
    working = true;
    const delay = 1000 * 60;
    while (autoConfirm || autoCancel || autoMoreWanted) {
        try {
            const ids = await getAllTrades();
            const tradeIds = ids.filter(id => !memory.includes(id));
            memory.push(...tradeIds);
            const tradesInfo = [];
            await Promise.all(
                tradeIds.map(async tradeId => {
                    tradesInfo.push(await tradeInfo(tradeId));
                })
            );
            await Promise.all(
                tradesInfo.map(async trade => {
                    const { tradeId, tradeCards, myCard } = trade;
                    if (!ranks.includes(myCard.rank)) return;
                    if (autoConfirm && tradeCards.length >= 2) {
                        await FetchService.confirmTrade(tradeId);
                        return;
                    }
                    else if (autoCancel && tradeCards.length === 1 && tradeCards.every(card => card.dubles)) {
                        await FetchService.cancelTradeByRecieved(tradeId);
                        return;
                    }
                    else if (autoMoreWanted && tradeCards.length === 1) {
                        const myCardUrl = UrlConstructor.getCardNeedUrl(myCard.id);
                        const offerCardUrl = UrlConstructor.getCardNeedUrl(tradeCards[0].id);
                        const [myUserList, offerUserList] = await Promise.all([
                            getUsersList(myCardUrl, {
                                limit:10000, 
                                pageLimit:10,
                            }),
                            getUsersList(offerCardUrl, {
                                limit:10000, 
                                pageLimit:10,
                            })
                        ]);

                        if (myUserList.length <= offerUserList.length) {
                            await FetchService.confirmTrade(tradeId);
                        }
                        else {
                            await FetchService.cancelTradeByRecieved(tradeId);
                        }
                        return;
                    }
                })
            );
        } catch (error) {
            console.error("Error during page update:", error);
        }
        finally {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    memory = [];
    working = false;
}

async function getAllTrades() {
    const dom = await FetchService.parseFetch(window.location.href);
    const tradeList = dom.querySelector('.trade__list');

    const links = tradeList ? tradeList.querySelectorAll('a') : [];
    const tradeIds = [];
    links.forEach((link) => {
        const href = link.getAttribute('href').match(/^\/trades\/(\d+)\//);
        if (href) {
            tradeIds.push(href[1]);
        }
    });
    return tradeIds;
}

async function tradeInfo(tradeId) {
    const dom = await FetchService.parseFetch(`/trades/${tradeId}/`)
    const tradeMainItems = dom.querySelectorAll('.trade__main-items');

    if (tradeMainItems.length >= 2) {
        const tradeCards = Array.from(tradeMainItems[0].querySelectorAll('a'))
            .map(link => {
                const href = link.getAttribute('href');
                const id = href.match(/^\/cards\/(\d+)\/users\/$/)[1];
                const img = link.querySelector("img");
                const dubles = img.getAttribute("class").includes("anime-cards__owned-by-user");
                return { id, dubles };
            })

        const link = tradeMainItems[1].querySelector('a');
        const href = link.getAttribute('href');
        const id = href.match(/^\/cards\/(\d+)\/users\/$/)[1];
        const dom = await FetchService.parseFetch(href);
        const { rank } = await getCardInfo(dom);
        const myCard = { id, rank };
        return { tradeId, tradeCards, myCard };
    }
}

class ButtonManager {
    constructor() {
        this.buttons = [];
    }

    async initialize() {
        this._createButtons();
        await this._displayButtons();
        this._eventListener();
    }

    _eventListener() {
        window.addEventListener('config-updated', async (event) => {
            switch (event.detail.key) {
                case "functionConfig":
                    await this._displayButtons();
                    break;
            }
        });
    }

    async _createButtons() {
        this.container = this._createContainer(".justify-center");

        const switcherAutoConfirm = new Switcher(
            {
                checked: false,
                onChange: (isChecked) => {
                    autoConfirm = isChecked;
                    if (autoConfirm) {
                        checkPage();
                    }
                },
                text: "Auto Confirm 2/3-to-1",
                place: ".div-for-extension",
            }
        )
    
        const switcherAutoCancel = new Switcher(
            {
                checked: false,
                onChange: (isChecked) => {
                    autoCancel = isChecked;
                    if (autoCancel) {
                        checkPage();
                    }
                },
                text: "Auto Cancel 1-to-1 dubles",
                place: ".div-for-extension",
            }
        )
    
    
        const switcherAutoMoreWanted = new Switcher(
            {
                checked: false,
                onChange: (isChecked) => {
                    autoMoreWanted = isChecked;
                    if (autoMoreWanted) {
                        checkPage();
                    }
                },
                text: "Auto Confirm/Cancel 1-to-1 by priority",
                place: ".div-for-extension",
            }
        )
    }

    async _displayButtons() {
        const { offersResolver } = await ExtensionConfig.getConfig("functionConfig");
        this.container.style.display = offersResolver ? "block" : "none";
    }

    _createContainer(querySelector) {
        const parentElement = document.querySelector(querySelector);
        const container = document.createElement("div");
        container.classList.add("div-for-extension");
        container.style.display = "none";
        parentElement.appendChild(container);
        return container;
    }
}


async function init() {
    // Initialize UI
    const buttonManager = new ButtonManager();
    await buttonManager.initialize();
}


// old code
// init()