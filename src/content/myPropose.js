async function propose(type) {
    const myUrl = UrlConstructor.getMyUrl();
    let rank = UrlConstructor.getCardRank();
    const my = new GetCards({ userUrl: myUrl, rank });

    const [myCards, myTrade] = await Promise.all([
        my.getInventory(true),
        my.getTrade()
    ]);
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
        await Fetch.proposeCard(id);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function proposeId(id) {
    let response;
    response = await Fetch.proposeCard(id);
    while (response.error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = await Fetch.proposeCard(id);
    }
}

async function init() {
    if (!UrlConstructor.isMyPage()) {
        return
    }
    const rank = UrlConstructor.getCardRank();
    if (!rank) {
        return
    }
    
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