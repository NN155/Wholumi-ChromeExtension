async function init() {
    if (!(await ExtensionConfig.getConfig("functionConfig")).tradeHelper) return;

    const tradeId = getMyCardId();
    const cards = getCards();
    cards.forEach(card => {
        if (card.id === tradeId) {
            card.card.click();
        }
    })
    scroll();
}

function scroll() {
    const element = document.querySelector('.trade__main-items');
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });
}

function getMyCardId() {
    const urlObj = new URL(window.location.href);
    const mycardId = urlObj.searchParams.get('mycard');
    return mycardId;
}

function getCards() {
    const container = document.querySelector('.trade__inventory-list');
    const nodes = container.querySelectorAll('.trade__inventory-item');
    let cards = new CardsArray();

    nodes.forEach(element => {
        const card = new Card(element);
        card.setId();
        cards.push(card);
    });
    return cards;
}

init()

