window.addEventListener("update-data-config", async (event) => {
    let data;
    switch(event.detail.key) {
        case "packInventory":
            data = await updateInventoryInfo();
            break;
        case "siteInventory": 
            data = await updateSiteInventory();
            break;
    }

    await ExtensionConfig.setConfig("dataConfig", { [event.detail.key]: data });
    const newEvent = new CustomEvent(event.detail.event, {
        detail: {
            id: event.detail.id,
        },
    });

    window.dispatchEvent(newEvent);
});

async function updateInventoryInfo() {
    const dom = await Fetch.parseFetch("/cards_showcase/");
    
    const container = dom.querySelector('.card-filter-list__items');

    const cards = new Set();

    container.querySelectorAll('.card-filter-list__card').forEach(item => {
        const dataId = item.getAttribute("data-id");
        if (dataId) {
            cards.add(dataId);
        }
    });

    return [...cards];
}

async function updateSiteInventory() {
    const cards = await getSiteInventory();
    for (const rank in cards) {
        const data = [];
        cards[rank].forEach(card => {
            data.push({ id: card.cardId, name : card.name, src: card.src });
        });
        cards[rank] = data;
    }
    return cards;
}

async function getSiteInventory() {
    const ranks = ["s", "a", "b", "c", "d", "e"];
    const baseUrl = "https://animestars.org/cards/?rank=";
    const userName = "Name";
    
    const cardsPromises = ranks.map(rank => {
        const cardInstance = new GetCards({ rank, userUrl: `${baseUrl}${rank}`, userName });
        return cardInstance.getAllCards(cardInstance.userUrl);
    });
    
    const [s, a, b, c, d, e] = await Promise.all(cardsPromises);
    const cards = {s, a, b, c, d, e};
    return cards
}


