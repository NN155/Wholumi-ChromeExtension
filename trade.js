async function showCards(rank) {
    ShowBar.createShowBar();
    const usersList = getUsersList();
    const usersCards = [];
    const myCards = await getMyCards(rank);
    for (let user of usersList) {
        const data = await checkUserCards(user, rank);
        usersCards.push(...data);
    }
    let cards = await compareWithMyCards(myCards, usersCards);
    cards.sort((a, b) => b.rate - a.rate);
    cards = cards.map(cardElement => {
        return cardElement.card;
    });
    ShowBar.addElementsToBar(cards);
}

async function checkUserCards(user, rank = "s") {
    let cards;
    const data = [];
    const { UserUrl, UserName } = user;

    const needUrl = UserUrl + '/cards/need/?rank=' + rank;

    cards = await cardFinder(needUrl);
    cards.forEach(card => {
        const { img } = getCardData(card);
        data.push({ card: card, img, UserName, UserUrl });
    });
    return data;
}



async function compareWithMyCards(myCards, cards) {
    let data = cards.filter(card => {
        return myCards.find(myCard => myCard.img === card.img)
    })
    data = data.map(card => {
        const myCard = myCards.find(myCard => myCard.img === card.img)
        const { rate } = myCard;
        return { ...card, rate }
    })
    data = data.map(cardElement => {
        let { card, rate, UserName, UserUrl } = cardElement;
        card = allModifiedCard({ card, UserUrl, UserName, rate });
        return { ...cardElement, card };
    })
    return data;
}

async function init() {
    const rank = await getCardRank();
    const text = `Show My ${rank} Cards`;
    createButton(text, () => showCards(rank));
}

init()