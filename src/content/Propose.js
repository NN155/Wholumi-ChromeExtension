async function propose(type) {
    const myUrl = UrlConstructor.getMyUrl();
    let rank = UrlConstructor.getCardRank();

    const [myCards, myTrade] = await proposeData(rank, myUrl);
    const ids = new Set();

    if (type) {
        myCards.forEach(card => {
            ids.add(card.cardId);
        });
        myTrade.forEach(card => {
            ids.delete(card.cardId);
        });
    }
    else {
        myTrade.forEach(card => {
            ids.add(card.cardId);
        });
    }

    await proposeAll(ids);
}

async function proposeAll(ids) {
    for (let id of ids) {
        await FetchService.proposeCard(id);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function proposeId(id) {
    let response;
    response = await FetchService.proposeCard(id);
    while (response.error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = await FetchService.proposeCard(id);
    }
}

async function proposeData(rank, myUrl) {
    let ranks = [rank];
    if (!rank) {
        ranks = ["a", "b", "c", "d", "e"];
    }
    const inventory = [];
    const trade = [];
    for (const rank of ranks) {
        const cardInstance = new GetCards({ rank, userUrl: myUrl, username: null });
    
        const [myCards, myTradeCards] = await Promise.all([
            cardInstance.getInventory({unlock: true}),
            cardInstance.getTrade()
        ]);
    
        inventory.push(...myCards);
        trade.push(...myTradeCards);
    }
    return [inventory, trade];
}
async function init() {
    if (!UrlConstructor.isMyPage()) {
        return
    }
    const rank = UrlConstructor.getCardRank();
    
    const proposeOn = new Button({
        text: `Propose ${rank ? rank : "All"}`,
        onClick: () => propose(true),
        place: ".tabs.tabs--center"
    });

    const proposeOff = new Button({
        text: `Clear ${rank ? rank : "All"}`,
        onClick: () => propose(false),
        place: ".tabs.tabs--center"
    });
}

init()