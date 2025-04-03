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

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: searchCards && anotherUserMode,
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
        input.display(searchCards && anotherUserMode);
    });
}

init()