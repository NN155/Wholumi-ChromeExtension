async function init() {
    getCard();
    setCardInterval();
}

async function fetchCard() {
    const responce = await fetch('/engine/ajax/controller.php?mod=reward_card&action=check_reward&user_hash=' + dle_login_hash);
    const data = await responce.text();
    const parsedData = JSON.parse(data);
    console.log(parsedData.reason || parsedData)
    return parsedData;
}

async function getCard() {
    await takeCard();
    const data = await fetchCard();

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
    while (true) {
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
    const cardInfo = await checkTakeCard()
    if (!cardInfo?.cards) {
        return;
    }
    await reportCardViewed(cardInfo.cards?.owner_id)
}

async function reportCardViewed(owner_id) {
    const response = await fetch('/engine/ajax/controller.php?mod=cards_ajax', {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            mod: "cards_ajax",
            action: "take_card",
            owner_id: owner_id,
            user_hash: dle_login_hash,
        })
    });
    const result = await response.json();
    return result;

}
async function checkTakeCard() {
    const response = await fetch("/engine/ajax/controller.php?mod=cards_ajax", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            mod: "cards_ajax",
            action: "check_take_card",
            user_hash: dle_login_hash,
        })
    });
    const data = await response.json();
    return data;
}


init();