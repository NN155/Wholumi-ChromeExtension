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

    changeCards(cards, cards.userCards, cardsFinder.rank, cardsFinder.src);

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

function changeCards(cards, myCards, rank, src) {
    cards.forEach(tradedCard => {
        tradedCard.addEventListener('click', async () => {
            const getCard = new GetCards({ userUrl: tradedCard.url, userName: tradedCard.userName, rank });
            const userInventory = await getCard.getInventory();
            const card = userInventory.find(card => card.src === src);
            const myCard = myCards.find(card => card.src === tradedCard.src);
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
                text = `${myCard.lock === "lock" ? "Unlock and " : ""}Trade`
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
    const { searchCards, anotherUserMode, graphSearch: graph } = await ExtensionConfig.getConfig("functionConfig");

    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const buttonSearchCards = new Button({
        text: `Compare Cards`,
        onClick: () => showCards({ input }),
        place: ".tabs.tabs--center.mb-2",
        display: searchCards,
    });

    const buttonGraphSearch = new Button({
        text: `Graph Search`,
        onClick: () => graphSearch({ input }),
        place: ".tabs.tabs--center.mb-2",
        display: graph,
    });

    input.place(".tabs.tabs--center.mb-2");

    window.addEventListener('config-updated', async () => {
        const { searchCards, anotherUserMode, graphSearch: graph } = await ExtensionConfig.getConfig("functionConfig");

        buttonSearchCards.display(searchCards);
        buttonGraphSearch.display(graph);
        input.display(anotherUserMode);
    });

}
init()
