const clubData = {
    autoBoost: false,
    firstBoost: false,
    stopUpdating: false,
    countBoost: 0,
    openCards: null,
    newDay: false,
    openCardsBoostOnly: false,
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
    while (!clubData.stopUpdating) {
        try {
            const { res, badData } = await updateCardInfo();
            if (res.boost_html) {
                clubData.firstBoost = false;
                clubData.newDay = !badData;
                updatePageInfo(res.boost_html, res.boost_count, res.top_html)

                const event = new CustomEvent('update-page-info', { detail: { html: res.boost_html, count: res.boost_count, top: res.top_html } });
                window.dispatchEvent(event);

                await boostCard.boosting()
            }
            else if (clubData.firstBoost) {
                clubData.firstBoost = false;
                await boostCard.boosting()
            }
            checkAutoOff(res.boost_count, res.top_html);
        } catch (error) {
            console.error("Error during page update:", error);
        }
        finally {
            await new Promise(async resolve => setTimeout(resolve, (await ExtensionConfig.getConfig("miscConfig")).clubBoost.autoUpdateDelay));
        }
    }
}

async function updateCardInfo() {
    const clubRefreshBtn = document.querySelector(".club__boost__refresh-btn")
    const cardId = clubRefreshBtn ? clubRefreshBtn.getAttribute("data-card-id") : 0;
    return { res: await FetchService.updateCardInfo(cardId), badData: !clubRefreshBtn };
}

function updatePageInfo(html, boostCount = null, top = null) {
    const container = document.querySelector(".club-boost--content")
    container.innerHTML = html;
    if (boostCount) {
        const boostLimit = document.querySelector(".boost-limit")
        boostLimit.innerHTML = boostCount;
    }
    if (top) {
        const nav = document.querySelector(".tabs")
        nav.innerHTML = top;
    }
}

class BoostCard {
    constructor() {
        this.cardId;
        this.clubId;
        this.time;
    }

    isBoostable() {
        if (clubData.autoBoost) {
            const button = document.querySelector(".club__boost-btn")
            if (button) {
                this.src = document.querySelector(".club-boost__image img").getAttribute("src")
                if (this._isOpen(this.src)) {
                    this.cardId = button.getAttribute("data-card-id")
                    this.clubId = button.getAttribute("data-club-id")
                    return true;
                }
            }
        }
        return false;
    }

    async boosting() {
        let res = {isFirstBoost: true, stop: false};
        while (true) {
            if (res.stop) return;
            if (!this.isBoostable()) return;
            if (res.isFirstBoost) {
                this.time = Date.now();
            }
            res = await this.Boost()
        }
    }
    async Boost() {
        if (clubData.autoBoost) {
            const event = new CustomEvent('boost-card', { detail: { cardId: this.cardId, clubId: this.clubId } });
            window.dispatchEvent(event);
            
            const res = await FetchService.boostCard(this.cardId, this.clubId)
            return await this._responceController(res)
        }
    }

    _isOpen(src) {
        if (!clubData.openCardsBoostOnly) return true;
        if (!clubData.openCards) return true;
        const isOpen = clubData.openCards.hasBySrc(src);
        return isOpen;
    }

    async _responceController(res) {
        console.log("Boost Response:", res)
        if (res.error) {
            const regex = /через\s*(-?\d+)\s*секунд/;
            const match = res.error.match(regex);

            if (match) {
                const delay = Math.abs(parseInt(match[1])) * 1000 - 1000;
                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    this.time = Date.now();
                }

                await new Promise(async resolve => setTimeout(resolve, await this._calculateDelay()));
                return { stop: false, isFirstBoost: false };
            } else {
                return { stop: true, isFirstBoost: false };
            }
        }
        if (res.boost_html_changed) {
            updatePageInfo(res.boost_html_changed)
            const event = new CustomEvent('update-page-info', { detail: { html: res.boost_html_changed} });
            window.dispatchEvent(event);
            return { stop: false, isFirstBoost: true };
        }
        else if (res.boost_html) {
            let event;
            event = new CustomEvent('boost-success');
            window.dispatchEvent(event);

            event = new CustomEvent('update-page-info', { detail: { html: res.boost_html} });
            window.dispatchEvent(event);

            clubData.openCards && clubData.openCards.removeBySrc(this.src)
            updatePageInfo(res.boost_html)
            return { stop: false, isFirstBoost: true };
        }
    }


    async _calculateDelay() {
        const { autoBoostDelay, customBoostTime, customBoostDelay } = (await ExtensionConfig.getConfig("miscConfig")).clubBoost;
        if ((await ExtensionConfig.getConfig("functionConfig")).customBoostMode) {
            const dif = Date.now() - this.time;
            if (dif > customBoostTime) {
                return customBoostDelay;
            }
            else if (customBoostTime - dif < autoBoostDelay) {
                return Math.abs(customBoostTime - dif);
            }
        }
        return autoBoostDelay;
    }
}

function checkAutoOff(countBoost, topBoost) {
    if (clubData.newDay && countBoost >= 300) {
        clubData.stopUpdating = true;
        switcherUpdatePage.turnOff()
    }
}

async function setOpenedCards() {
    const hash = (await ExtensionConfig.loadConfig("dataConfig", ["openedInventory"])).openedInventory;
    const cards = new CardsHash();
    cards.hash = hash;
    clubData.openCards = cards
}

async function setConfig() {
    const { clubBoost, openCards } = await ExtensionConfig.getConfig("functionConfig");
    box1.display(clubBoost);

    clubData.openCardsBoostOnly = openCards;
}

async function setRateLimit() {
    const { clubBoost } = await ExtensionConfig.getConfig("miscConfig", ["clubBoost"]);
    const { requestLimit } = clubBoost;
    saveFetchConfig.requestLimit.max = requestLimit;
}

async function init() {
    await setRateLimit();
    await setConfig();
    await setOpenedCards();
}

const box1 = new Box({
    display: false,
    displayType: "flex",
    place: ".secondary-title.text-center",
    className: "extension__box1",
    center: true,
})
const box2 = new Box({
    displayType: "block",
    place: ".extension__box1",
    className: "extension__box2",
})

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
        place: ".extension__box2",
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
        place: ".extension__box2",
    }
)

const boostCard = new BoostCard();
init();

window.addEventListener('config-updated', async (event) => {
    switch (event.detail.key) {
        case "functionConfig":
            await setConfig();
            break;
        case "lastUpdate":
            await setOpenedCards();
            break;
        case "miscConfig":
            await setRateLimit();
            break;
    }
});

window.addEventListener('boost-success', () => {
    clubData.countBoost++
    switcherAutoBoost.text(`Auto Boost Card (${clubData.countBoost})`)
})