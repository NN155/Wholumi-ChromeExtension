async function showCards(rank) {
    ShowBar.createShowBar();
    const usersList = getUsersList();
    let cards = [];
    for (let user of usersList) {
        const data = await checkUserCards(user, rank);
        cards.push(...data);
    }
    cards.sort((a, b) => b.rate - a.rate);
    cards = cards.map(card => {
        return card.card;
    });
    ShowBar.addElementsToBar(cards);
}


async function checkUserCards(user, rank = "s") {
    const data = [];
    const { UserUrl, UserName } = user;
    const cards = await GetAndRateUsersCards({ UserUrl, UserName, rank });
    cards.forEach(element => {
        let { card, rate } = element;
        card = allModifiedCard({ card, rate, UserUrl, UserName });
        data.push({ card, rate, UserName });
    });
    return data;
}

async function init() {
    const rank = await getCardRank();
    const text = `Show ${rank} Cards`;
    createButton(text, () => showCards(rank));
}

init();