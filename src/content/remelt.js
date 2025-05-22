class Remelt {
    constructor() {
        this.cardsMap = new Map();
        this.cards;
        this.initialized = false;
    }

    getCards() {
        if (this.initialized) {
            return this.cards;
        }
        const container = document.querySelector('.remelt__inventory');
        const nodes = container.querySelectorAll('.remelt__inventory-item');
        let cards = new CardsArray();

        nodes.forEach(element => {
            const card = new Card(element);
            card.setId();
            card.setSrc();
            card.setLock();
            cards.push(card);
            this.cardsMap.set(card.id, card);
        });
        this.initialized = true;
        return cards;
    }

    colorCards(cards, color) {

        this.getCards(); // Ensure cardsMap is initialized

        const cardMap = this.cardsMap;

        for (let i = 0; i < cards.length; i++) {
            const c = cards[i];
            const card = cardMap.get(c.id);
            if (card) {
                card.card.style.backgroundColor = color;
            }
        }
    }
}

async function unlockCards(cards) {
    for (let card of cards) {
        await card.unlockCard();
    }
    window.location.reload();
}


function getRank() {
    const rankLink = document.querySelector('.remelt__rank-item.remelt__rank-item--active')
    const rankUrl = rankLink.href;
    const rankMatch = rankUrl.match(/rank=([a-z])/i);
    const rank = rankMatch ? rankMatch[1] : null;
    return rank;
}

function getDubles(cards) {

    const dubles = new CardsArray();
    const firstDuble = new CardsArray();
    const unique = new Map();

    const duplicateIds = new Set();



    for (let index = cards.length - 1; index >= 0; index--) {
        const card = cards[index];
        if (unique.has(card.cardId)) {
            const cards = unique.get(card.cardId);
            duplicateIds.add(card.cardId);
            cards.push(card);
        } else {
            unique.set(card.cardId, [card]);
        }
    };

    for (const cardId of duplicateIds) {
        const cards = unique.get(cardId);
        firstDuble.push(cards[0]);

        for (let index = 1; index < cards.length; index++) {
            const card = cards[index];
            dubles.push(card);
        }
    };


    return { dubles, firstDuble };
}

async function search(remelt) {
    const rank = getRank();
    const promises = [];


    const isAll = !window.location.href.includes('locked=0')

    promises.push(GetCards.getByDeck());

    if (!isAll) {
        promises.push(GetCards.getByRemelt({ rank }));
    }


    const cards = remelt.getCards();

    const deck = await promises[0];
    let remeltCards;
    if (isAll) {
        remeltCards = cards;
    } else {
        remeltCards = await promises[1];
    }
    

    GetCards._proccessCards({remelt: remeltCards, deck});

    return deck;
}


async function init() {
    const { remeltDubles } = await ExtensionConfig.getConfig("functionConfig");
    if (!remeltDubles) return;
    const remelt = new Remelt();

    const cards = await search(remelt);


    const { dubles, firstDuble } = getDubles(cards);

    remelt.colorCards(dubles, 'red');
    remelt.colorCards(firstDuble, 'green');

    const lockedCards = dubles.getLockedCards();
    const text = `Unlock ${lockedCards.length} Cards`;

    new Button({
        text,
        onClick: async () => await unlockCards(lockedCards),
        disabled: lockedCards.length === 0,
        place: ".remelt__rank-list"
    });
}

init()