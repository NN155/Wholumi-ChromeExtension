async function showCards({ input }) {
    ShowBar.createShowBar();
    
    let username = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);

    const cardsFinder = new CardsFinder({ username,  id, limit: 200, pageLimit: 7});
    const cards = await cardsFinder.users();
    if (cards.error) {
        ShowBar.text(cards.error);
        return;
    }

    changeCards(cards);
    ShowBar.addElementsToBar(cards.getCardsArray());
}

async function init() {
    const { searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
    
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

init()