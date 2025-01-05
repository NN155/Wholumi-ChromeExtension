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

    await Promise.all([...ids].map(cardId => Fetch.proposeCard(cardId)));
}

async function init() {
    if (!UrlConstructor.isMyPage()) {
        return
    }
    const rank = UrlConstructor.getCardRank();
    if (!rank) {
        return
    }
    
    const proposeOn = new Button();
    proposeOn.text(`Propose ${rank ? rank : "All"}`);
    proposeOn.onclick = () => propose(true);
    await proposeOn.place(".tabs.tabs--center");

    const proposeOff = new Button();
    proposeOff.text(`Clear ${rank ? rank : "All"}`);
    proposeOff.onclick = () => propose(false);
    await proposeOff.place(".tabs.tabs--center");
}

init()