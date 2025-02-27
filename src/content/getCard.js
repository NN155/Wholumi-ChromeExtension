async function init() {
    setCardInterval();
}

async function getCard() {
    const data = await Fetch.recieveCard();

    if (data.stop_reward === "yes") {
        return {stop_reward: "yes"};
    }
    else {
        return {continue: "yes"};
    }
}

async function setCardInterval() {
    while (!await getCard()) {
        await delay(1000 * 169);
        if (await getCard()) {
            break;
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setPingInterval() {
    while (!await sendPing()) {
        await delay(1000 * 169);
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