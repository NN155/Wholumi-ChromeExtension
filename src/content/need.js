async function showCards({ input, testMode = false }) {
    ShowBar.createShowBar();

    isAnotherUser = !!input.getValue()
    let username = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);

    const cardsFinder = new CardsFinderService({ testMode });
    try {
        const cards = await cardsFinder.need({username, id, verifyUser: isAnotherUser });
        ShowBar.addElementsToBar(cards.getCardsArray());
    } catch (error) {
        if (error instanceof CardsFinderError) {
            ShowBar.text(error.message);
            return;
        }
        console.error(error);
        ShowBar.text("ERROR");
    }
}

async function init() {
    const { searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
    
    const text = `Show Cards`;

    const box = new Box({
        display: searchCards,
        displayType:"flex",
        placeAfter: ".ncard__offer-send-btn",
        className: "extension__box",
        center: true,
    })

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const button = new Button({
        text: text,
        onClick: () => showCards({ input }),
        place: ".extension__box",
    });

    input.place(".extension__box");

    window.addEventListener('config-updated' , async () => {
        const {searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
        box.display(searchCards);
        input.display(anotherUserMode);
    });
}

init();