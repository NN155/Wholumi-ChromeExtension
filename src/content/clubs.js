let autoBoost = false;
let stopUpdating = false;
let countBoost = 0
let openCards = null;
let globalDelay = 50;

let newDay = false;
let badData = false;

saveFetchConfig = {
    ...saveFetchConfig,
    delay: {
        ...saveFetchConfig.delay,
        min: 0,
    },
}
async function autoUpdatePageInfo() {
    if (stopUpdating) return;
    const delay = 200 + globalDelay;
    while (!stopUpdating) {
        try {
            const { res, badData } = await updateCardInfo();
            checkAutoOff(res.boost_count);
            if (res.boost_html) {
                newDay = !badData;
                updatePageInfo(res.boost_html, res.boost_count, res.top_html)
                
                const event = new CustomEvent("page-info-updated");
                window.dispatchEvent(event);
                
                await eventBoostCard()
            }
        } catch (error) {
            console.error("Error during page update:", error);
        }
        finally {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

function clubCardInfo() {
    const src = document.querySelector(".club-boost__image img").getAttribute("src")
    const ownerLists = document.querySelectorAll('.club-boost__owners-list');

    const links = [];

    ownerLists.forEach(list => {
        links.push(list.querySelector('a').getAttribute("href"));
    });

    return { links, src }
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
    if (button && autoBoost) {
        const cardId = button.getAttribute("data-card-id")
        const clubId = button.getAttribute("data-club-id")
        const src = document.querySelector(".club-boost__image img").getAttribute("src")
        if (isOpen(src)) {
            const res = await Fetch.boostCard(cardId, clubId)
            responceController(res, src)
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
                await new Promise(resolve => setTimeout(resolve, globalDelay));
                await eventBoostCard()
        }
        return;
    }

    if (res.boost_html_changed) {
        updatePageInfo(res.boost_html_changed)
    }
    else if (res.boost_html) {
        countBoost++
        switcherAutoBoost.text(`Auto Boost Card (${countBoost})`)
        openCards && openCards.removeBySrc(src)
        updatePageInfo(res.boost_html)
    }

    const event = new CustomEvent("page-info-updated");
    window.dispatchEvent(event);

    await eventBoostCard()
}

function checkAutoOff(countBoost) {
    if (newDay && countBoost >= 300) {
        stopUpdating = true;
        switcherUpdatePage.turnOff()
    }
}

async function eventBoostCard() {
    if (autoBoost) {
        await boostCard()
    }
}

const switcherAutoBoost = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {
            autoBoost = isChecked
            if (autoBoost) {
                eventBoostCard()
            }
        }
    }
)

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
    openCards = hashCards;
    scanButton.text("Scanned")
}



function isOpen(src) {
    if (!openCards) return true;
    const isOpen = openCards.hasBySrc(src);
    return isOpen;
}

switcherAutoBoost.disable()
switcherAutoBoost.text(`Auto Boost Card (${countBoost})`)

const switcherUpdatePage = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {

            if (isChecked) {
                newDay = false;
                switcherAutoBoost.enable()
                stopUpdating = false;
                autoUpdatePageInfo();
            } else {
                switcherAutoBoost.turnOff()
                switcherAutoBoost.disable()
                stopUpdating = true;
            }
        }
    }
)
switcherUpdatePage.text("Auto Page Info Update")

switcherUpdatePage.place(".secondary-title.text-center")
switcherAutoBoost.place(".secondary-title.text-center")
const scanButton = new Button({
    text: "scan open cards",
})
scanButton.onclick = getOpenInventoryCards
scanButton.place(".secondary-title.text-center")