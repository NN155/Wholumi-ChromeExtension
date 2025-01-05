let autoBoost = false;
let autoUnlock = false;
let stopUpdating = false;
let cardId = 0;
let countBoost = 0
let openCards = null;
async function autoUpdatePageInfo() {
    if (stopUpdating) return;
    const delay = 200;
    while (!stopUpdating) {
        try {
            const isNewCard = await updateCardInfo();
            if (autoBoost && isNewCard) {
                cardId++;
                await eventBoostCard({ detail: { id: cardId } });
            }
        } catch (error) {
            console.error("Error during page update:", error);
        }
        finally {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function updateCardInfo() {
    const cardId = document.querySelector(".club__boost__refresh-btn").getAttribute("data-card-id")
    const res = await Fetch.updateCardInfo(cardId)
    if (res.boost_html) {
        updatePageInfo(res.boost_html)
    }
    return res.boost_html;
}

function updatePageInfo(html) {
    const container = document.querySelector(".club-boost--content")
    container.innerHTML = html
}

async function boostCard(id) {
    const button = document.querySelector(".club__boost-btn")
    if (button && autoBoost) {
        const cardId = button.getAttribute("data-card-id")
        const clubId = button.getAttribute("data-club-id")
        const src = document.querySelector(".club-boost__image img").getAttribute("src")
        if (isOpen(src)) {
            const res = await Fetch.boostCard(cardId, clubId)
            responceController(res, id, src)
        }
    }
}

async function responceController(res, id, src) {
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
                await eventBoostCard({ detail: { id: id } })
        }
    }
    else if (res.boost_html_changed) {
        updatePageInfo(res.boost_html_changed)
    }
    else if (res.boost_html) {
        countBoost++
        switcherAutoBoost.text(`Auto Boost Card (${countBoost})`)
        openCards && openCards.removeBySrc(src)
        updatePageInfo(res.boost_html)
    }

}

async function eventBoostCard(event) {
    if (autoBoost) {
        await boostCard(event.detail.id)
    }
}

const switcherAutoBoost = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {
            autoBoost = isChecked
            if (autoBoost) {
                eventBoostCard({ detail: { id: cardId } })
            }
        }
    }
)

async function getOpenInventoryCards(button) {
    const myUrl = UrlConstructor.getMyUrl();
    const ranks = ["c","d","e"]
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
    button.text("Scanned")
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
const button = new Button({
    text: "scan open cards",
})
button.onclick = () => getOpenInventoryCards(button)
button.place(".secondary-title.text-center")