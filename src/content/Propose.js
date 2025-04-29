async function propose(type) {
    let rank = UrlConstructor.getCardRank();

    const [myCards, myTrade] = await proposeData(rank);
    const ids = new Set();

    if (type) {
        myCards.forEach(card => {
            ids.add(card.cardId);
        });
        myTrade.forEach(card => {
            ids.delete(card.cardId);
        });
    }
    else {
        myTrade.forEach(card => {
            ids.add(card.cardId);
        });
    }
    
    await ProtectedFetchService.proposeCards(ids, 1);
}

async function proposeData(rank) {
    let ranks = [rank];
    if (!rank) {
        ranks = ["a", "b", "c", "d", "e"];
    }
    const inventory = [];
    const trade = [];
    for (const rank of ranks) {
        const cardInstance = new GetCards({ rank, user: new User({userUrl: UrlConstructor.getMyUrl()})});

        const [myCards, myTradeCards] = await Promise.all([
            cardInstance.getInventory({ unlock: true }),
            cardInstance.getTrade()
        ]);

        inventory.push(...myCards);
        trade.push(...myTradeCards);
    }
    return [inventory, trade];
}

class ButtonManager {
    constructor() {
        this.buttons = [];
    }

    async initialize() {
        if (!UrlConstructor.isMyPage()) return;

        this._createBox();
        this._createButtons();
        await this._display();
        this._eventListener();
    }

    _eventListener() {
        window.addEventListener('config-updated', async (event) => {
            switch (event.detail.key) {
                case "functionConfig":
                    await this._display();
                    break;
            }
        });
    }

    async _createButtons() {
        // Build Deck button
        const rank = UrlConstructor.getCardRank();

        const proposeOn = new Button({
            text: `Propose ${rank ? rank : "All"}`,
            onClick: () => propose(true),
            place: ".extension__box",
        });

        const proposeOff = new Button({
            text: `Clear ${rank ? rank : "All"}`,
            onClick: () => propose(false),
            place: ".extension__box",
        });

        this.buttons.push(proposeOn, proposeOff);
    }

    async _display() {
        const { propose } = await ExtensionConfig.getConfig("functionConfig");
        this.box.display(propose);
    }

    async _handleButtonClick(callback) {
        // Lock all buttons
        this.buttons.forEach(button => button.disable());

        try {
            await callback();
        } catch (error) {
            DLEPush.error("Something went wrong");
            console.error("Error in button action:", error);
        } finally {
            // Re-enable all buttons
            this.buttons.forEach(button => button.enable());
        }
    }

    _createBox() {
        this.box = new Box({
            place: ".tabs.tabs--center",
            display: false,
            className: "extension__box",
            gap: "0.5em",
        });
    }
}


async function init() {
    // Initialize UI
    const buttonManager = new ButtonManager();
    await buttonManager.initialize();
}

init()