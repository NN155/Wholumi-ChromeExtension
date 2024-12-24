async function showCards({rank, src}) {
    ShowBar.createShowBar();
    const usersList = await getUsersList(document, {
        limit:1000, 
        pageLimit:10,
    });
    const myUrl = UrlConstructor.getMyUrl();
    const my = new GetCards({userUrl: myUrl, rank});
    const myCards = await my.getInventory();
    const usersCards = await findUsersCards(usersList, user => getUserNeed(user, rank));
    const cards = await compareCards(myCards, usersCards);
    cards.forEach(card => {
        card.fixCard();
        card.fixLockIcon();
        card.addLink();
        card.setColorByRate();
        card.removeBorderds();
    });
    changeCards(cards, myCards, {rank, src});

    if (cards.length() > 75) {
        cards.filter(card => card.rate > 0);
    }
    cards.sort();
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


async function init() {
    const dom = await getDomCardRank();
    const {rank, src} = await getCardInfo(dom);
    const text = `Show My ${rank} Cards`;
    const button = new Button();
    button.text(text);
    button.place(".tabs.tabs--center.mb-2");
    button.onclick = () => showCards({rank, src});
}
init()