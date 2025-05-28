async function showCards({ input, testMode }) {
    ShowBar.createShowBar();
    
    isAnotherUser = !!input.getValue();
    let username = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);

    const cardsFinder = new CardsFinderService({ testMode });
    try {
        const { userCardsMap, usersCardsMap } = await cardsFinder.users({username, id, verifyUser: isAnotherUser, limit: 200 });
        
        const cardsBuilder = new CardsBuilder({ userCardsMap, usersCardsMap, testMode});
        const cardsRender = new CardsRender({ cardsBuilder, testMode });
        cardsRender.render();
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
    const { searchCards, anotherUserMode, testMode} = await ExtensionConfig.getConfig("functionConfig");
    
    const text = `Compare Cards`;


    const box = new Box({
        display: searchCards,
        displayType:"flex",
        placeAfter: ".ncard__tabs",
        className: "extension__box",
        center: true,
    })

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const button = new Button({
        text: text,
        onClick: () => showCards({ input, testMode }),
        place: ".extension__box",
    });

    input.place(".extension__box");

    window.addEventListener('config-updated' , async () => {
        const {searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
    
        box.display(searchCards);
        input.display(anotherUserMode);
    });
}

init()