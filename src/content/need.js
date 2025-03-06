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

    changeCards(cards);

    ShowBar.addElementsToBar(cards.getCardsArray());
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