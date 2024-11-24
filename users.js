async function showCards({rank, src}) {
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
    changeCards(cards, myCards, {rank, src});

    ShowBar.addElementsToBar(cards.getCardsArray());
}

function changeCards(cards, myCards, {rank, src}) {
    cards.forEach(tradeCard => {
        tradeCard.addEventListener('click', async () => {
            const getCard = new GetCards({ userUrl: tradeCard.url, userName: tradeCard.userName, rank });
            const userInventory = await getCard.getInventory();
            const card = userInventory.find(card => card.src === src);
            const myCard = myCards.find(card => card.src === tradeCard.src);
            const button = new Button();
            let text;
            if (!card) {
                text = "In trade or not found";
                button.disable();
            }
            else if (tradeCard.rate < 0) {
                text = "This card is locked";
                button.disable();
            }
            else if (myCard.lock === "trade") {
                text = "This card is in trade";
                button.disable();
            }
            else {
                text = `${myCard.lock === "lock" ? "Unlock and ": ""}Trade`
            }
            button.text(text);
            button.place(".anime-cards__controls")
            if (myCard) {
                button.addEventListener('click', async () => {
                await trade(card, myCard);
                });
            }
        })
    })
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
    button.addEventListener('click', () => showCards({rank, src}));
}

init()