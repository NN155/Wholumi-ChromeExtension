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


async function setPingInterval() {
    while (!await sendPing()) {
        await delay(1000 * 168);
        if (await sendPing()) {
            break;
        }
    }
}

async function sendPing() {
    const response = await ExtensionConfig._sendMessageAsync({ action: "get-card", mode: "ping-tab"})
    if (response.stop) {
        return true;
    }
    else if (response.skip) {
        return false;
    }

    const cardResponse = await getCard();
    if (cardResponse.stop_reward === "yes") {
        await ExtensionConfig._sendMessageAsync({ action: "get-card", mode: "block-hour"})
        return true;
    }
    return false;
}

function newInit() {
    setPingInterval()
}

newInit();
// init();