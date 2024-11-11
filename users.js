async function showCards(rank) {
    ShowBar.createShowBar();
    const usersList = await getUsersList();
    const myUrl = UrlConstructor.getMyUrl();
    const myCards = await getInventoryTrade({userUrl: myUrl, rank});
    const usersCards = await findUsersCards(usersList, user => checkUserCards(user, rank));
    const cards = await compareWithMyCards(myCards, usersCards);
    cards.sortByRate();
    cards.forEach(card => {
        card.fixCard()
        card.addLockIcon()
        card.fixLockIcon()
        card.addLink()
        card.setColorByRate()
        card.removeBorderds()
    });

    ShowBar.addElementsToBar(cards.getCardsArray());
}

async function checkUserCards(user, rank = "s") {
    const { userUrl, userName, lock } = user;
    const getCards = new GetCards({ userUrl, userName, rank });
    const cards = await getCards.getNeed();
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
    const {rank, src} = await getCardInfo(document);
    const text = `Show My ${rank} Cards`;
    const button = new Button();
    button.text(text);
    button.place(".tabs.tabs--center");
    button.addEventListener('click', () => showCards(rank));
}

init()