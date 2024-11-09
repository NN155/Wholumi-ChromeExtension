async function showCards({rank, src}) {
    ShowBar.createShowBar();
    const usersList = await getUsersList();
    const myCards = await getMyCards(rank);

    const usersCards = await findUsersCards(usersList, user => checkUserCards(user, rank));

    const cards = await compareWithMyCards(myCards, usersCards);
    cards.sortByRate();
    cards.forEach(card => {
        card.fixCard();
        card.fixLockIcon();
        card.addLink();
        card.setColorByRate();
        card.removeBorderds();
    });
    myCards.forEach(card => {
        card.setId();
        card.setLock();
    });
    changeCards(cards, myCards, {rank, src});

    ShowBar.addElementsToBar(cards.getCardsArray());
}

function changeCards(cards, myCards, {rank, src}) {
    cards.forEach(cardElement => {
        cardElement.addEventListener('click', async () => {
            const url = cardElement.url + '/cards/?rank=' + rank;
            const userCards = await cardFinder(url);
            userCards.forEach(card => {
                card.setId();
            });
            const card = userCards.find(card => card.src === src);
            const myCard = myCards.find(card => card.src === cardElement.src);
            const button = new Button();
            let text;
            if (!card) {
                text = "In trade or not found";
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
        return myCard;
    })
    return cards;
}

async function init() {
    const dom = await getDomCardRAnk();
    const {rank, src} = await getCardInfo(dom);
    const text = `Show My ${rank} Cards`;
    const button = new Button();
    button.text(text);
    button.place(".tabs.tabs--center.mb-2");
    button.addEventListener('click', () => showCards({rank, src}));
}

init()