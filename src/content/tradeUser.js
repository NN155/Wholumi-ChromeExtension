class TradePageManager {
    constructor() {
        this.cards;
    }

    scroll() {
        const element = document.querySelector('.trade__main-items');
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }

    getData() {
        const urlObj = new URL(window.location.href);
        const tradeId = urlObj.searchParams.get('mycard');
        const unlock = urlObj.searchParams.get('unlock');

        return { tradeId, unlock };
    }

    getCards() {
        if (this.cards) return this.cards;

        const container = document.querySelector('.trade__inventory-list');
        const nodes = container.querySelectorAll('.trade__inventory-item');
        let cards = new Map();

        nodes.forEach(element => {
            const card = new Card(element);
            card.setId();
            cards.set(card.id, card);
        });

        this.cards = cards;
        return cards;
    }

    async unlockById(id) {
        const card = this.cards.get(id);
        const unlock = card.hasClass('trade__inventory-item--lock');
        if (unlock && card) {
            card.lock = "lock";
            await card.unlockCard();
            card.removeClass('trade__inventory-item--lock')
            card.addClass('trade__inventory-item--dontlock')
        }
    }

    clickById(id) {
        const card = this.cards.get(id);
        if (card) {
            card.card.click();
        }
    }
}

async function init() {
    if (!(await ExtensionConfig.getConfig("functionConfig")).tradeHelper) return;
    const tradePageManager = new TradePageManager();
    const { tradeId, unlock } = tradePageManager.getData();
    if (!tradeId) return;

    tradePageManager.getCards();

    if (tradeId && unlock) {
        await tradePageManager.unlockById(tradeId);
    }
    tradePageManager.clickById(tradeId);
    tradePageManager.scroll();
}

// Not working
// init()