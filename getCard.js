function init() {
    getCard();
    setCardInterval();
}

async function fetchCard() {
    const responce = await fetch('/engine/ajax/controller.php?mod=reward_card&action=check_reward');
    const data = await responce.text();
    const parsedData = JSON.parse(data);
    console.log(parsedData)
    return parsedData;
}

async function getCard() {
    const data = await fetchCard();

    if (data.stop_reward === "YES") {
        return true;
    }
    else if (data.reason == 'Есть выданная карта, которую пользователь не забрал') {
        takeCard();
    }
    else if (data?.cards) {
        const card = data.cards
        console.log(card);
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
            action: "check_take_card"
        })
    });
    const data = await response.json();
    return data;
}

init();