let autoBoost = false;
let autoUnlock = false;
let stopUpdating = false;
let cardId = 0;
let countBoost = 0

async function autoUpdatePageInfo() {
    if (stopUpdating) return;
    while (!stopUpdating) {
        try {
            const isNewCard = await updateCardInfo();
            if (autoBoost && isNewCard) {
                cardId++;
                const event = new CustomEvent("update-page-extension", { detail: { id: cardId } });
                window.dispatchEvent(event);
            }
        } catch (error) {
            console.error("Error during page update:", error);
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
        const res = await Fetch.boostCard(cardId, clubId)
        responceController(res, id)
    }
}

async function responceController(res, id) {
    console.log("Boost Response:", res)
    if (res.error) {
        switch (res.error) {
            case "Ваша карта заблокирована, для пожертвования клубу разблокируйте её":
            case "У вас нет карты для пожертвования клубу, обновите страницу и попробуйте снова":
            case "Достигнут дневной лимит пожертвований в клуб, подождите до завтра":
            case "Вклады в клуб временно отключены и находятся на обновлении":
                break;
        }
    }
    else if (res.boost_html_changed) {
        updatePageInfo(res.boost_html_changed)
    }
    else if (res.boost_html) {
        countBoost++
        switcherAutoBoost.text(`Auto Boost Card (${countBoost})`)
        updatePageInfo(res.boost_html)
    }
    else {
        await new Promise(resolve => setTimeout(resolve, 500))
        const event = new CustomEvent("update-page-extension", { detail: { id: id } });
        window.dispatchEvent(event);
    }
}

window.addEventListener('update-page-extension', async (event) => {
    if (event.detail.id === cardId) {
        await boostCard(event.detail.id)
    }
});

const switcherAutoBoost = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {
            autoBoost = isChecked
            if (autoBoost) {
                const event = new CustomEvent("update-page-extension", { detail: { id: cardId } });
                window.dispatchEvent(event);
            }
        }
    }
)
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

