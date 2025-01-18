const clubData = {
    autoBoost: false,
    firstBoost: false,
    stopUpdating: false,
    countBoost: 0,
    openCards: null,
    globalDelay: 75,
    newDay: false,
    telegramBotBool: false,
}

saveFetchConfig = {
    ...saveFetchConfig,
    delay: {
        ...saveFetchConfig.delay,
        min: 0,
    },
}
async function autoUpdatePageInfo() {
    if (clubData.stopUpdating) return;
    const delay = 250;
    while (!clubData.stopUpdating) {
        try {
            const { res, badData } = await updateCardInfo();
            if (res.boost_html) {

                clubData.firstBoost = false;
                clubData.newDay = !badData;
                updatePageInfo(res.boost_html, res.boost_count, res.top_html)
                if (clubData.telegramBotBool) {
                    const event = new CustomEvent("page-info-updated", { detail: { html: res.boost_html, top: res.top_html, count: res.boost_count, } });
                    clubData.newDay && window.dispatchEvent(event);
                }
                await eventBoostCard()
            }
            else if (clubData.firstBoost) {
                clubData.firstBoost = false;
                await eventBoostCard()
            }
            checkAutoOff(res.boost_count, res.top_html);
        } catch (error) {
            console.error("Error during page update:", error);
        }
        finally {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function updateCardInfo() {
    const clubRefreshBtn = document.querySelector(".club__boost__refresh-btn")
    const cardId = clubRefreshBtn ? clubRefreshBtn.getAttribute("data-card-id") : 0;
    return {res: await Fetch.updateCardInfo(cardId), badData: !clubRefreshBtn};
}

function updatePageInfo(html, boostCount = null, top = null) {
    const container = document.querySelector(".club-boost--content")
    container.innerHTML = html;
    if (boostCount && top) {
        const nav = document.querySelector(".tabs")
        const boostLimit = document.querySelector(".boost-limit")
        nav.innerHTML = top;
        boostLimit.innerHTML = boostCount;
    }
}

async function boostCard() {
    const button = document.querySelector(".club__boost-btn")
    if (button && clubData.autoBoost) {
        const cardId = button.getAttribute("data-card-id")
        const clubId = button.getAttribute("data-club-id")
        const src = document.querySelector(".club-boost__image img").getAttribute("src")
        if (isOpen(src)) {
            const res = await Fetch.boostCard(cardId, clubId)
            await responceController(res, src)
        }
    }
}

async function responceController(res, src) {
    console.log("Boost Response:", res)
    if (res.error) {
        switch (res.error) {
            case "Ваша карта заблокирована, для пожертвования клубу разблокируйте её":
            case "У вас нет карты для пожертвования клубу, обновите страницу и попробуйте снова":
            case "Достигнут дневной лимит пожертвований в клуб, подождите до завтра":
            case "Вклады в клуб временно отключены и находятся на обновлении":
                break;
            default:
                const regex = /через\s*(-?\d+)\s*секунд/;

                const match = res.error.match(regex);
                if (match) {
                    const delay = Math.abs(parseInt(match[1])) * 1000 - 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                await new Promise(resolve => setTimeout(resolve, clubData.globalDelay));
                await eventBoostCard()
        }
        return;
    }

    if (res.boost_html_changed) {
        updatePageInfo(res.boost_html_changed)
    }
    else if (res.boost_html) {
        clubData.countBoost++
        switcherAutoBoost.text(`Auto Boost Card (${clubData.countBoost})`)
        clubData.openCards && clubData.openCards.removeBySrc(src)
        updatePageInfo(res.boost_html)
    }
    if (clubData.telegramBotBool) {
        const event = new CustomEvent("page-info-updated", { detail: { html: res.boost_html_changed || res.boost_html } });
        window.dispatchEvent(event);
    }
    await eventBoostCard()
}

function checkAutoOff(countBoost, topBoost) {
    if (clubData.newDay && countBoost >= 300) {
        if (clubData.telegramBotBool) {
            const event = new CustomEvent("clubs-day-limit-reached", { detail: { top: topBoost } }); 
            window.dispatchEvent(event);
        }
        clubData.stopUpdating = true;
        switcherUpdatePage.turnOff()
    }
}

async function eventBoostCard() {
    if (clubData.autoBoost) {
        await boostCard()
    }
}

async function getOpenInventoryCards() {
    const myUrl = UrlConstructor.getMyUrl();
    const ranks = ["c", "d", "e"]
    const cards = new CardsArray();
    await Promise.all(
        ranks.map(async (rank) => {
            const my = new GetCards({ userUrl: myUrl, rank });
            const myCards = await my.getInventory(true);
            cards.push(...myCards);
        })
    );
    cards.filter(card => card.lock !== "trade");
    const hashCards = new HashCards();
    cards.forEach(card => hashCards.add(card));
    clubData.openCards = hashCards;
    scanButton.text("Scanned")
}

function isOpen(src) {
    if (!clubData.openCards) return true;
    const isOpen = clubData.openCards.hasBySrc(src);
    return isOpen;
}

const switcherUpdatePage = new Switcher(
    {
        checked: false,
        text: "Auto Page Info Update",
        onChange: (isChecked) => {

            if (isChecked) {
                clubData.newDay = false;
                switcherAutoBoost.enable()
                clubData.stopUpdating = false;
                autoUpdatePageInfo();
            } else {
                switcherAutoBoost.turnOff()
                switcherAutoBoost.disable()
                clubData.stopUpdating = true;
            }
        },
        place: ".secondary-title.text-center"
    }
)

const switcherAutoBoost = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {
            clubData.autoBoost = isChecked
            clubData.firstBoost = isChecked
        },
        disabled: true,
        text: `Auto Boost Card (${clubData.countBoost})`,
        place: ".secondary-title.text-center",
    }
)

const switcherTelegram = new Switcher({
    checked: false,
    onChange: (isChecked) => {
        clubData.telegramBotBool = isChecked;
    },
    text: "Telegram Bot",
    place: ".secondary-title.text-center"
})

const scanButton = new Button({
    text: "scan open cards",
    onclick: getOpenInventoryCards,
    place: ".secondary-title.text-center"
})
