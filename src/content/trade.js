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

    const buttonSearchCards = new Button({
        text: `Compare Cards`,
        onClick: () => showCards({ input }),
        place: ".extension__box",
    });

    const buttonGraphSearch = new Button({
        text: `Graph Search`,
        onClick: () => graphSearch({ input }),
        place: ".extension__box",
        display: graph,
    });

    input.place(".extension__box");

    window.addEventListener('config-updated', async () => {
        const { searchCards, anotherUserMode, graphSearch: graph } = await ExtensionConfig.getConfig("functionConfig");

        box.display(searchCards);
        buttonGraphSearch.display(graph);
        input.display(anotherUserMode);
    });

}
init()
