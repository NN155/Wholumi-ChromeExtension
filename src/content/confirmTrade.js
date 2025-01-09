let autoConfirm = false;
let autoCancel = false;
let autoMoreWanted = false;
let working = false;
let memory = [];

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
                    if (myCard.rank === "s") return;
                    if (autoConfirm && tradeCards.length >= 2) {
                        await Fetch.confirmTrade(tradeId);
                        return;
                    }
                    else if (autoCancel && tradeCards.length === 1 && tradeCards.every(card => card.dubles)) {
                        await Fetch.cancelTradeByRecieved(tradeId);
                        return;
                    }
                    else if (autoMoreWanted && tradeCards.length === 1) {
                        const myCardUrl = UrlConstructor.getCardNeedUrl(myCard.id);
                        const offerCardUrl = UrlConstructor.getCardNeedUrl(tradeCards[0].id);
                        const [myCardDom, offerCardDom] = await Promise.all([
                            Fetch.parseFetch(myCardUrl),
                            Fetch.parseFetch(offerCardUrl)
                        ]);
                        const [myUserList, offerUserList] = await Promise.all([
                            getUsersList(myCardDom, {
                                limit:10000, 
                                pageLimit:10,
                            }),
                            getUsersList(offerCardDom, {
                                limit:10000, 
                                pageLimit:10,
                            })
                        ]);

                        if (myUserList.length > offerUserList.length) {
                            await Fetch.cancelTradeByRecieved(tradeId);
                        }
                        else {
                            await Fetch.confirmTrade(tradeId);
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
    const dom = await Fetch.parseFetch(window.location.href);
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
    const dom = await Fetch.parseFetch(`/trades/${tradeId}/`)
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
        const dom = await Fetch.parseFetch(href);
        const { rank } = await getCardInfo(dom);
        const myCard = { id, rank };
        return { tradeId, tradeCards, myCard };
    }
}

function createContainer(querySelector) {
    const parentElement = document.querySelector(querySelector);
    const container = document.createElement("div");
    container.classList.add("div-for-extension");
    parentElement.appendChild(container);
    return container;
}

async function init() {
    createContainer(".justify-center");

    const switcherAutoConfirm = new Switcher(
        {
            checked: false,
            onChange: (isChecked) => {
                autoConfirm = isChecked;
                if (autoConfirm) {
                    checkPage();
                }
            }
        }
    )

    switcherAutoConfirm.text(`Auto Confirm 2/3-to-1`)

    const switcherAutoCancel = new Switcher(
        {
            checked: false,
            onChange: (isChecked) => {
                autoCancel = isChecked;
                if (autoCancel) {
                    checkPage();
                }
            }
        }
    )
    switcherAutoCancel.text("Auto Cancel 1-to-1 dubles")


    const switcherAutoMoreWanted = new Switcher(
        {
            checked: false,
            onChange: (isChecked) => {
                autoMoreWanted = isChecked;
                if (autoMoreWanted) {
                    checkPage();
                }
            }
        }
    )

    switcherAutoMoreWanted.text("Auto Confirm/Cancel 1-to-1 by priority")

    switcherAutoConfirm.place(".div-for-extension")
    switcherAutoCancel.place(".div-for-extension")
    switcherAutoMoreWanted.place(".div-for-extension")
}

init();