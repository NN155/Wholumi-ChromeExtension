// Обробник події
window.addEventListener("update-data-config", async (event) => {
    switch(event.detail.key) {
        case "packInventory":
            const cards = await updateInventoryInfo();
            const newEvent = new CustomEvent("data-config-updated", {
                detail: {
                    key: "packInventory",
                    cards: cards,
                },
            });
            window.dispatchEvent(newEvent);
            break;
    }
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

    return cards;
}