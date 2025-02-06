async function showCards({ input }) {
    ShowBar.createShowBar();

    let userName = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);

    const cardsFinder = new CardsFinder({ userName,  id});
    const cards = await cardsFinder.trade();
    if (cards.error) {
        ShowBar.text(cards.error);
        return;
    }

    changeCards(cards, cards.userCards, cardsFinder.rank, cardsFinder.src);

    ShowBar.addElementsToBar(cards.getCardsArray());
}

function changeCards(cards, myCards, rank, src) {
    cards.forEach(tradedCard => {
        tradedCard.addEventListener('click', async () => {
            const getCard = new GetCards({ userUrl: tradedCard.url, userName: tradedCard.userName, rank });
            const userInventory = await getCard.getInventory();
            const card = userInventory.find(card => card.src === src);
            const myCard = myCards.find(card => card.src === tradedCard.src);
            console.log(userInventory, card, myCard);
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

    const text = `Compare Cards`;

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const button = new Button({
        text: text,
        onClick: () => showCards({ input }),
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
