class TradeProcessor {
    constructor() {
        this.mode = this._setMode();
        this._addEventListeners();
    }

    async seachCards({ username }) {

        this.testMode && console.log(`TradeProcessor: seachCards, mode: ${this.mode}, username: ${username}, url: ${window.location.href}, usersLimit: ${this.usersLimit}, onlineOnly: ${this.onlineOnly}`);

        ShowBar.createShowBar();

        const isAnotherUser = !!username;
        username = username || UrlConstructor.getMyName();
        let id = UrlConstructor.getCardId(window.location.href);

        const cardsFinder = new CardsFinderService({ testMode: this.testMode });
        try {
            const { userCardsMap, usersCardsMap } = await cardsFinder[this.mode]({ username, id, verifyUser: isAnotherUser, limit: this.usersLimit, online: this.onlineOnly });

            const cardsBuilder = new CardsBuilder({ userCardsMap, usersCardsMap, testMode: this.testMode });
            const cardsRender = new CardsRender({ cardsBuilder, testMode: this.testMode });
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

    _addEventListeners() {
        window.addEventListener('config-updated', async () => {
            await this.setConfig();
        });
    }

    _setMode() {
        const url = window.location.href;
        if (url.includes("/trade/")) {
            return "trade";
        } else {
            return "users";
        }
    }

    async setConfig() {
        const { testMode, onlineOnly } = await ExtensionConfig.getConfig("functionConfig");
        const { searchCards } = await ExtensionConfig.getConfig("miscConfig", ["searchCards"]);
        const { usersLimit } = searchCards;
        this.testMode = testMode;
        this.usersLimit = usersLimit;
        this.onlineOnly = onlineOnly;
    }
}
class TradeInitializer {
    constructor() {
        this.input;
        this.box;
        this.button;
    }

    async init() {
        await this._setConfig();
        this._initUi();
        this._addEventListeners();
    }

    async _setConfig() {
        const { searchCards, anotherUserMode } = await ExtensionConfig.getConfig("functionConfig");
        this.searchCards = searchCards;
        this.anotherUserMode = anotherUserMode;
    }

    _addEventListeners() {
        window.addEventListener('config-updated', async () => {
            const { searchCards, anotherUserMode } = await ExtensionConfig.getConfig("functionConfig");

            this.box.display(searchCards);
            this.input.display(anotherUserMode);
        });
    }

    _initUi() {
        let querySelector;
        const querySelectors = [".ncard__offer-send-btn", ".ncard__tabs"];
        for (const selector of querySelectors) {
            let container = document.querySelector(selector);
            if (container) {
                querySelector = selector;
                break;
            }
        }

        this.box = new Box({
            display: this.searchCards,
            displayType: "flex",
            placeAfter: querySelector,
            className: "extension__box",
            center: true,
        })

        this.button = new Button({
            text: `Compare Cards`,
            place: ".extension__box",
        });

        this.input = new Input({
            text: UrlConstructor.getMyName(),
            display: this.anotherUserMode,
            place: ".extension__box",
        });
    }

    buttonOnClick(callback) {
        this.button.onClick = callback;
    }

    getUsername() {
        return this.input.getValue();
    }
}

async function init() {
    const tradeInitializer = new TradeInitializer();
    await tradeInitializer.init();

    const tradeProcessor = new TradeProcessor();
    tradeProcessor.setConfig();
    tradeInitializer.buttonOnClick((async () => {
        await tradeProcessor.seachCards({ username: tradeInitializer.getUsername() });
    }))
}

init()