async function showCards(rank) {
    ShowBar.createShowBar();
    const usersList = await getUsersList();
    const usersCards = await findUsersCards(usersList, user => checkUserCards(user, rank));

    usersCards.sortByRate();
    usersCards.forEach(card => {
        card.fixCard()
        card.fixLockIcon()
        card.addLink()
        card.setColorByRate()
    })
    ShowBar.addElementsToBar(usersCards.getCardsArray());
}


async function checkUserCards(user, rank = "s") {
    const { userUrl, userName } = user;
    const cards = await GetAndRateUsersCards({ userUrl, userName, rank });
    return cards;
}

async function init() {
    const dom = await getDomCardRAnk();
    const rank = await getCardRank(dom);
    const text = `Show ${rank} Cards`;
    createButton(text, () => showCards(rank));
}

init();