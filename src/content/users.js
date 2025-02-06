async function showCards({ input }) {
    ShowBar.createShowBar();
    
    let userName = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);

    const cardsFinder = new CardsFinder({ userName,  id, limit: 200, pageLimit: 7});
    const cards = await cardsFinder.users();
    if (cards.error) {
        ShowBar.text(cards.error);
        return;
    }

    changeCards(cards, cards.userCards, cardsFinder.rank, cardsFinder.src);

    ShowBar.addElementsToBar(cards.getCardsArray());
}

function changeCards(cards, myCards, rank, src) {
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
            else if (tradeCard.rate < 0) {
                text = "This card is locked";
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
    const { searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
    
    const text = `Compare Cards`;

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const button = new Button({
        text: text,
        onClick: () => showCards({ input }),
        place: ".tabs.tabs--center",
        display: searchCards,
    });

    input.place(".tabs.tabs--center");

    window.addEventListener('config-updated' , async () => {
        const {searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
    
        button.display(searchCards);
        input.display(anotherUserMode);
    });
}

init()