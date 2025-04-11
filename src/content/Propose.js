async function propose(type) {
    const myUrl = UrlConstructor.getMyUrl();
    let rank = UrlConstructor.getCardRank();

    const [myCards, myTrade] = await proposeData(rank, myUrl);
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

    await proposeAll(ids);
}

async function proposeAll(ids) {
    await ProtectedFetchService.proposeCards(ids, 1);
}

async function proposeData(rank, myUrl) {
    let ranks = [rank];
    if (!rank) {
        ranks = ["a", "b", "c", "d", "e"];
    }
    const inventory = [];
    const trade = [];
    for (const rank of ranks) {
        const cardInstance = new GetCards({ rank, userUrl: myUrl, username: null });

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

        this._createButtons();
        await this._displayButtons();
        this._eventListener();
    }

    _eventListener() {
        window.addEventListener('config-updated', async (event) => {
            switch (event.detail.key) {
                case "functionConfig":
                    await this._displayButtons();
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
            place: ".tabs.tabs--center",
            display: false,
        });

        const proposeOff = new Button({
            text: `Clear ${rank ? rank : "All"}`,
            onClick: () => propose(false),
            place: ".tabs.tabs--center",
            display: false,
        });

        this.buttons.push(proposeOn, proposeOff);
    }

    async _displayButtons() {
        const { propose } = await ExtensionConfig.getConfig("functionConfig");
        this.buttons.forEach(item => {
            item.display(propose);
        });
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
}


async function init() {
    // Initialize UI
    const buttonManager = new ButtonManager();
    await buttonManager.initialize();
}

init()