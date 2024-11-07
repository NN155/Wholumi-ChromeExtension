async function showCards(rank) {
    ShowBar.createShowBar();
    const usersList = await getUsersList();
    const myCards = await getMyCards(rank);
    const usersCards = await findUsersCards(usersList, user => checkUserCards(user, rank));
    const cards = await compareWithMyCards(myCards, usersCards);
    cards.sortByRate();
    cards.forEach(card => {
        card.fixCard()
        card.addLockIcon()
        card.fixLockIcon()
        card.addLink()
        card.setColorByRate()
    });

    ShowBar.addElementsToBar(cards.getCardsArray());
}

async function checkUserCards(user, rank = "s") {
    const { userUrl, userName, lock } = user;
    const needUrl = userUrl + '/cards/need/?rank=' + rank;
    const cards = await cardFinder(needUrl);
    cards.forEach(card => {
        card.userName = userName;
        card.url = userUrl;
        if (lock === "lock") {
            card.rate = -1;
        }
    });
    return cards;
}

async function compareWithMyCards(myCards, cards) {
    cards.filter(card => {
        const myCard = myCards.find(myCard => myCard.src === card.src)
        if (myCard) {
            card.rate = card.rate < 0 ? card.rate : myCard.rate;
            card.lock = myCard.lock;
            return myCard
        }
    })
    return cards;
}

async function init() {
    const rank = await getCardRank(document);
    const text = `Show My ${rank} Cards`;
    createButton(text, () => showCards(rank));
}

init()