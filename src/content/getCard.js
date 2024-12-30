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
        return true;
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


init();