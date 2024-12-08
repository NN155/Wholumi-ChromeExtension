async function randomTrade(button2 = null) {
    const url = document.querySelector(".button.button--block").getAttribute("href");
    const dom = await Fetch.parseFetch(url)
    const usersList = await getUsersList(dom, true, 5)
    const { rank, src } = await getCardInfo(dom);
    const tradeInfo = await checkTradeInfoUsers(usersList, { rank, src });
    const myUrl = UrlConstructor.getMyUrl();
    const myCards = await getMyCountCards(myUrl, rank);
    await asyncTrade(myCards, tradeInfo);
    button2 && changeCurrentCount(button2);
}

async function asyncTrade(cards, tradeInfo) {
    const minLen = Math.min(cards.length, tradeInfo.length);
    const promises = [];
    for (let i = 0; i < minLen; i++) {
        const myCard = cards[i];
        const info = tradeInfo[i];
        promises.push(Fetch.tradeFetch(info, myCard.id));
    }
    await Promise.all(promises);
}

async function checkTradeInfoUsers(usersList, { rank, src }) {
    const promises = usersList.map(async (user) => {
        const { userUrl, userName } = user;
        const getCard = new GetCards({ userUrl, userName, rank });
        const userInventory = await getCard.getInventory();
        const card = userInventory.find(card => card.src === src);
        if (card) {
            const info = await getCardTradeInfo(card);
            return info || null;
        }
        return null;
    });
    const results = await Promise.all(promises);
    return results.filter(info => info !== null);
}

async function getCardTradeInfo(card) {
    const url = `/cards/${card.id}/trade`
    const dom = await Fetch.parseFetch(url);
    const tradeDiv = dom.querySelector(".cards--container");
    try {
        const info = {
            receiver: tradeDiv.getAttribute("data-receiver"),
            receiver_id: tradeDiv.getAttribute("data-receiver-id"),
            trade_id: tradeDiv.getAttribute("data-trade-id"),
            sender_foto: tradeDiv.getAttribute("data-sender-foto"),
            original_card: tradeDiv.getAttribute("data-original-id"),
        };
        return info;
    }
    catch (e) {
        console.log(e);
    }
    return false;
}

async function getMyCountCards(myUrl, rank, count = 5) {
    const my = new GetCards({ userUrl: myUrl, rank });
    const myCards = await my.getInventory(true);
    return getRandomNodes(myCards, count);
}

function getRandomNodes(nodesArray, count) {
    const result = [];
    const copy = [...nodesArray];
    const n = copy.length;

    for (let i = 0; i < count && i < n; i++) {
        const randomIndex = Math.floor(Math.random() * (n - i)) + i;
        [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
        result.push(copy[i]);
    }

    return result;
}
async function getActiveTrades() {
    const dom = await Fetch.parseFetch("/trades/offers/");

    const tradeItems = Array.from(dom.querySelectorAll(".trade__list-item"));
    const ids = [];
    for (const item of tradeItems) {
        let id = item.getAttribute("href").replace("/trades/offers/", "").replace("/", "");
        ids.push(id);
    }
    return ids;
}

async function cancelAllTrades(button2 = null) {
    const ids = await getActiveTrades();
    const promises = ids.map(id => Fetch.cancelTrade(id));
    await Promise.all(promises);
    button2 && changeCurrentCount(button2);
}
async function changeCurrentCount(button2) {
    const ids = await getActiveTrades();
    text = `Cancel All Trades (${ids.length})`;
    button2.text(text);
}


async function init() {
    const button1 = new Button();
    const button2 = new Button();

    button1.button.classList.add("trade-button-by-extension");
    button2.button.classList.add("cancel-button-by-extension");

    button1.button.style.margin = "5px";
    button2.button.style.margin = "5px";

    let text = "Trade 5 Times";
    button1.text(text);
    button1.place(".club-boost__owners");
    button1.onclick = () => randomTrade(button2);

    text = "Cancel All Trades";
    button2.text(text);
    button2.place(".club-boost__owners");
    button2.onclick = () => cancelAllTrades(button2);
    button2.button.style.minWidth = "250px";
    changeCurrentCount(button2);
}

init();
