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

            let text;
            let disabled = false;

            if (!card) {
                text = "In trade or not found";
                disabled = true;
            }
            else if (myCard.lock === "trade") {
                text = "This card is in trade";
                disabled = true;
            }
            else {
                text = `${myCard.lock === "lock" ? "Unlock and ": ""}Trade`
            }

            const button = new Button({
                disabled,
                text,
                onClick: async () => {
                    await trade(card, myCard);
                }
            });

            await button.asyncPlace(".anime-cards__controls")
        })
    })
}

async function init() {
    const { searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");

    const dom = await getDomCardRank();
    const {rank, src} = await getCardInfo(dom);

    const text = `Compare ${rank} Cards`;

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const button = new Button({
        text: text,
        onClick: () => showCards({rank, src, input}),
        place: ".tabs.tabs--center.mb-2",
        display: searchCards,
    });

    input.place(".tabs.tabs--center.mb-2");

    window.addEventListener('config-updated' , async () => {
        const {searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
    
        button.display(searchCards);
        input.display(anotherUserMode);
    });

}
init()
