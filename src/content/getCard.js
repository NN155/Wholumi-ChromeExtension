async function init() {
    setCardInterval();
}

async function getCard() {
    await takeCard();
    const data = await Fetch.recieveCard();

    if (data?.cards) {
        await takeCard();
        const card = data.cards
    }

    else if (data.reason == 'Есть выданная карта, которую пользователь не забрал') {
        await takeCard();
    }
    if (data.stop_reward === "yes") {
        return {stop_reward: "yes"};
    }
    else {
        return {continue: "yes"};
    }
}

async function setCardInterval() {
    while (!await getCard()) {
        await delay(1000 * 168);
        if (await getCard()) {
            break;
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeCard() {
    const cardInfo = await Fetch.checkTakeCard()
    if (!cardInfo?.cards) {
        return;
    }
    await Fetch.reportCardViewed(cardInfo.cards?.owner_id)
}

let getCardPromise = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'get-card') {
        if (getCardPromise) {
            getCardPromise.then(sendResponse);
        } else {
            getCardPromise = (async () => {
                const response = await getCard();
                return response;
            })();

            getCardPromise.then(response => {
                sendResponse(response);
                getCardPromise = null;
            });
        }

        return true;
    }
});
chrome.runtime.sendMessage({ action: "get-card", mode: "ping-tab" });
// init();