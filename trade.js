async function showCards(rank) {
    ShowBar.createShowBar();
    const usersList = await getUsersList();
    const myCards = await getMyCards(rank);

    const usersCards = await findUsersCards(usersList, user => checkUserCards(user, rank));

    const cards = await compareWithMyCards(myCards, usersCards);
    cards.sortByRate();
    cards.forEach(card => {
        card.fixCard()
        card.fixLockIcon()
        card.addLink()
        card.setColorByRate()
        card.removeBorderds()
    });

    ShowBar.addElementsToBar(cards.getCardsArray());
}

async function checkUserCards(user, rank = "s") {
    const { userUrl, userName } = user;
    const needUrl = userUrl + '/cards/need/?rank=' + rank;

    const cards = await cardFinder(needUrl);
    cards.forEach(card => {
        card.userName = userName;
        card.url = userUrl;
    });
    return cards;
}



async function compareWithMyCards(myCards, cards) {

    cards.filter(card => {
        const myCard = myCards.find(myCard => myCard.src === card.src)
        if (myCard)
            card.rate = myCard.rate;
        return myCard
    })

    return cards;
}

async function init() {
    const dom = await getDomCardRAnk();
    const rank = await getCardRank(dom);
    const text = `Show My ${rank} Cards`;
    const button = createButton(text, ".tabs.tabs--center.mb-2");
    button.addEventListener('click', () => showCards(rank));
}

init()