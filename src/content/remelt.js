class Remelt {
    constructor() {
        this.cards = this.getCards();
    }

    getCards() {
        const container = document.querySelector('.remelt__inventory');
        const nodes = container.querySelectorAll('.remelt__inventory-item');
        let cards = new CardsArray();

        nodes.forEach(element => {
            const card = new Card(element);
            card.setId();
            card.setSrc();
            card.setLock();
            cards.push(card);
        });
        return cards;
    }

    colorCards(cards, color) {
        this.cards.forEach(card => {
            if (cards.find(c => c.id === card.id)) {
                card.card.style.backgroundColor = color;
            }
        });
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
    const dubles = new CardsArray()
    const firstDuble = new CardsArray();
    const uniqueSrc = new Set();
    for (let index = cards.length - 1; index >= 0; index--) {
        const card = cards[index];
        if (uniqueSrc.has(card.src)) {
            dubles.push(card)
        } else {
            uniqueSrc.add(card.src);
            firstDuble.push(card);
        }
    };
    firstDuble.filter(card => {
        return dubles.find(duble => {
            return card.src === duble.src;
        })
    })
    return { dubles, firstDuble };
}

async function search() {
    let remelt;
    const rank = getRank();
    if (!window.location.href.includes('locked=0')) {
        remelt = GetCards._getByRemelt(document);
    } else {
        remelt = await GetCards.getByRemelt({rank});
    }
    const showcase = await GetCards.getByShowcase({rank});
    GetCards._proccessCards(showcase, remelt);
    return showcase;
}


async function init() {

    const { remeltDubles } = await ExtensionConfig.getConfig("functionConfig");
    if (!remeltDubles) return;
    const cards = await search();
    const { dubles, firstDuble } = getDubles(cards);
    const remelt = new Remelt();
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