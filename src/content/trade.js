async function showCards({ input }) {
    ShowBar.createShowBar();

    let userName = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);

    const cardsFinder = new CardsFinder({ userName, id });
    const cards = await cardsFinder.trade();
    if (cards.error) {
        ShowBar.text(cards.error);
        return;
    }

    changeCards(cards);

    ShowBar.addElementsToBar(cards.getCardsArray());
}

async function graphSearch({ input }) {
    ShowBar.createShowBar();

    const userNameInput = input.getValue() || UrlConstructor.getMyName();

    const userName = await UrlConstructor.validateUser(userNameInput);
    if (userName === null) {
        ShowBar.text("User not found");
        return;
    }

    const userUrl = UrlConstructor.getUserUrl(userName);
    const id = UrlConstructor.getCardId(window.location.href);
    const cardUrl = UrlConstructor.getCardUrl(id);
    const dom = await Fetch.parseFetch(cardUrl);
    const { rank } = getCardInfo(dom);
    if (rank !== "s") return;

    const getCards = new GetCards({ userUrl: userUrl, rank: rank });
    const userCards = await getCards.getInventory();
    const cardsIds = userCards.cards.map(card => card.cardId);

    const graph = new GraphSearch();
    await graph.loadData(rank);

    const paths = graph.need(cardsIds, id);
    paths.sort((a, b) => a.ids.length - b.ids.length);

    const graphPaths = new GraphsPaths({ paths, rank });
    await graphPaths.initialize();
    const buildedPaths = graphPaths.buildPaths();
    ShowBar.addElementsToBar([buildedPaths]);
}

async function init() {
    const { searchCards, anotherUserMode, graphSearch: graph } = await ExtensionConfig.getConfig("functionConfig");

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const buttonSearchCards = new Button({
        text: `Compare Cards`,
        onClick: () => showCards({ input }),
        place: ".tabs.tabs--center.mb-2",
        display: searchCards && searchCards,
    });

    const buttonGraphSearch = new Button({
        text: `Graph Search`,
        onClick: () => graphSearch({ input }),
        place: ".tabs.tabs--center.mb-2",
        display: searchCards && graph,
    });

    input.place(".tabs.tabs--center.mb-2");

    window.addEventListener('config-updated', async () => {
        const { searchCards, anotherUserMode, graphSearch: graph } = await ExtensionConfig.getConfig("functionConfig");

        buttonSearchCards.display(searchCards);
        buttonGraphSearch.display(searchCards && graph);
        input.display(searchCards && anotherUserMode);
    });

}
init()
