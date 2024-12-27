async function showCards({rank, src, input}) {
    ShowBar.createShowBar();

    const userName = input.getValue();
    const myUrl = userName ? UrlConstructor.getUserUrl(userName) : UrlConstructor.getMyUrl();
    const my = new GetCards({userUrl: myUrl, rank});
    let myCards;
    try {
        myCards = await my.getInventory();
    }
    catch {
        ShowBar.text("User not found");
        return;
    }
    
    const usersList = await getUsersList(document, {
        limit:1000, 
        pageLimit:10,
    });
    
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
    const button = new Button();
    const input = new Input();
    const dom = await getDomCardRank();
    const {rank, src} = await getCardInfo(dom);
    const text = `Compare ${rank} Cards`;
    button.text(text);
    button.onclick = () => showCards({rank, src, input});
    input.text(UrlConstructor.getMyName());
    await button.place(".tabs.tabs--center.mb-2");
    input.place(".tabs.tabs--center.mb-2");
}
init()