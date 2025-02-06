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
                await boostCard.firstBoost()
            }
            else if (clubData.firstBoost) {
                clubData.firstBoost = false;
                await boostCard.firstBoost()
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
    return { res: await Fetch.updateCardInfo(cardId), badData: !clubRefreshBtn };
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

    async firstBoost() {
        if (this.isBoostable()) {
            this.time = Date.now();
            await this.Boost()
        }
    }

    async Boost() {
        if (clubData.autoBoost) {
            const res = await Fetch.boostCard(this.cardId, this.clubId)
            await this._responceController(res)
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
            switch (res.error) {
                case "Ваша карта заблокирована, для пожертвования клубу разблокируйте её":
                case "У вас нет карты для пожертвования клубу, обновите страницу и попробуйте снова":
                case "Достигнут дневной лимит пожертвований в клуб, подождите до завтра":
                case "Вклады в клуб временно отключены и находятся на обновлении":
                case "Взносы отключены с 20:55 до 21:01":
                    break;
                default:
                    const regex = /через\s*(-?\d+)\s*секунд/;

                    const match = res.error.match(regex);
                    if (match) {
                        const delay = Math.abs(parseInt(match[1])) * 1000 - 1000;
                        if (delay > 0) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                            this.time = Date.now();
                        }
                    }

                    await new Promise(async resolve => setTimeout(resolve, await this._calculateDelay()));

                    await this.Boost()
            }
            return;
        }
        if (res.boost_html_changed) {
            updatePageInfo(res.boost_html_changed)
            const dif = Date.now() - this.time;
            logs.push({"Time": dif, "Success": false});
            await this.firstBoost()
        }
        else if (res.boost_html) {
            clubData.countBoost++
            switcherAutoBoost.text(`Auto Boost Card (${clubData.countBoost})`)
            clubData.openCards && clubData.openCards.removeBySrc(this.src)
            updatePageInfo(res.boost_html)
            const dif = Date.now() - this.time;
            logs.push({"Time": dif, "Success": true});
            await this.firstBoost()
        }       
    }


    async _calculateDelay() {
        const {autoBoostDelay, customBoostTime, customBoostDelay} = (await ExtensionConfig.getConfig("miscConfig")).clubBoost;
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

const logs = [];

function checkAutoOff(countBoost, topBoost) {
    if (clubData.newDay && countBoost >= 300) {
        console.log(logs);
        clubData.stopUpdating = true;
        switcherUpdatePage.turnOff()
    }
}

async function setOpenedCards() {
    const hash = (await ExtensionConfig.loadConfig("dataConfig", ["openedInventory"])).openedInventory;
    const cards = new HashCards();
    cards.hash = hash;
    clubData.openCards = cards
}

async function init() {
    const { clubBoost } = await ExtensionConfig.getConfig("functionConfig");
    const array = [switcherUpdatePage, switcherAutoBoost];
    array.forEach(item => {
        item.display(clubBoost)
        item.place(".secondary-title.text-center")
    });
    clubData.openCardsBoostOnly = (await ExtensionConfig.getConfig("functionConfig")).openCards;
    await setOpenedCards();
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
    }
)

const boostCard = new BoostCard();
init();

window.addEventListener('config-updated', async (event) => {
    switch (event.detail.key) {
        case "functionConfig":
            const { clubBoost } = await ExtensionConfig.getConfig("functionConfig");
            switcherUpdatePage.display(clubBoost);
            switcherAutoBoost.display(clubBoost);
            clubData.openCardsBoostOnly = (await ExtensionConfig.getConfig("functionConfig")).openCards;
            break;
        case "dataConfig":
            await setOpenedCards();
            break;
    }
});