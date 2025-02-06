async function showCards({ input }) {
    ShowBar.createShowBar();

    let userName = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);
    
    const cardsFinder = new CardsFinder({ userName,  id});
    const cards = await cardsFinder.need();
    if (cards.error) {
        ShowBar.text(cards.error);
        return;
    }

    changeCards(cards, cards.userCard);

    ShowBar.addElementsToBar(cards.getCardsArray());
}

function changeCards(usersCards, myCard) {
    usersCards.forEach(card => {
        card.addEventListener('click', async () => {
            let text;
            let disabled = false;

            if (!myCard) {
                text = "In trade or not found";
                disabled = true;
            }
            else if (card.lock !== "unlock") {
                text = "This card is locked";
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

    const text = `Show Cards`;

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

init();