async function showCards({ input }) {
    ShowBar.createShowBar();

    let username = input.getValue() || UrlConstructor.getMyName();
    let id = UrlConstructor.getCardId(window.location.href);

    const cardsFinder = new CardsFinder({ username, id });
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

    const usernameInput = input.getValue() || UrlConstructor.getMyName();

    const username = await UrlConstructor.validateUser(usernameInput);
    if (username === null) {
        ShowBar.text("User not found");
        return;
    }

    const userUrl = UrlConstructor.getUserUrl(username);
    const id = UrlConstructor.getCardId(window.location.href);
    const cardUrl = UrlConstructor.getCardUrl(id);
    const dom = await FetchService.parseFetch(cardUrl);
    const { rank } = getCardInfo(dom);
    if (rank !== "s") return;

    const getCards = new GetCards({ user: new User({userUrl}), rank: rank });
    const userCards = await getCards.getInventory();
    const cardsIds = userCards.map(card => card.cardId);

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
