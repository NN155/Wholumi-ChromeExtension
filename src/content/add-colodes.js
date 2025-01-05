async function addColodes() {
    const my = new GetCards({ ran: "s", userUrl: "https://animestars.org/cards/?rank=s", userName: "Name" })
    const cards = await my.getAllCards(my.userUrl)
    cards.map(card => card.cardId);
    let count = 1;
    const cardsIds = cards.cards
    for (let i = 0; i < cardsIds.length; i += 49) {
        const batch = cardsIds.slice(i, i + 49);
        batch.push(15706)
        await fetchApi(batch, count);
        count += 1;
    }

}

async function fetchApi(cardsIds, count) {
    const url = "https://animestars.org/engine/ajax/controller.php?mod=decks_ajax";
    const body = new URLSearchParams({
        user_hash: dle_login_hash,
        is_trade: 0,
        description: "Да все 1000 S карт в моем инвентаре. Я их спрятал <3",
        name: `Все карты S-тира на сайте. Часть ${count}`,
        action: "create",

    });

    const ownerIds = Array(cardsIds.length).fill(3105421);
    cardsIds.forEach((id) => {
        body.append("card_ids[]", id);
    });
    ownerIds.forEach((id) => {
        body.append("card_owner_ids[]", id);
    });

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
    });

}
async function init() {
    const button = new Button();
    const text = `Add colodes`;
    button.text(text);
    button.onclick = () => addColodes();
    await button.place(".secondary-title.text-center");
}

init()