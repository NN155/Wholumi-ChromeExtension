let autoBoost = false;
let autoUnlock = false;
let stopUpdating = false;

async function pageUpdateInfo() {
    if (stopUpdating) return;
    let nextTimeout = 1000;
    try {
        const url = window.location.href;
        const startTime = performance.now();
        const dom = await Fetch.parseFetch(url);
        const endTime = performance.now();

        const responseTime = (endTime - startTime) / 1000;

        const data = getPageInfo(dom);
        updatePageInfo(document, data);

        const event = new CustomEvent("update-page-extension", { detail: data });
        window.dispatchEvent(event);

        nextTimeout = responseTime > 0.5 ? 4000 : 1000;
    } catch (error) {
        console.error("Error during page update:", error);
    } finally {
        if (!stopUpdating) {
            setTimeout(pageUpdateInfo, nextTimeout);
        }
    }
}


function getPageInfo(dom) {
    const src = dom.querySelector(".club-boost__image img").getAttribute("src")
    const ownersList = dom.querySelector(".club-boost__owners-list")
    const boostChangeCount = dom.querySelector(".club-boost__change span")
    const rulesInfo = dom.querySelector(".club-boost__rules")
    const clubBoostTop = dom.querySelector(".club-boost__top")
    const clubBoostInner = dom.querySelector(".club-boost--content > :last-child")
    return {
        src,
        ownersList,
        boostChangeCount,
        rulesInfo,
        clubBoostTop,
        clubBoostInner
    }
}

function updatePageInfo(dom, { src, ownersList, boostChangeCount, rulesInfo, clubBoostTop, clubBoostInner }) {
    const domSrc = dom.querySelector(".club-boost__image img")
    const domSrcUrl = domSrc.getAttribute("src")
    updateElement(domSrc, 'src', src);
    updateElement(dom.querySelector(".club-boost__owners-list"), 'innerHTML', ownersList);
    updateElement(dom.querySelector(".club-boost__change span"), 'innerText', boostChangeCount);
    updateElement(dom.querySelector(".club-boost__rules"), 'innerHTML', rulesInfo);
    if (domSrcUrl !== src) {
        updateElement(dom.querySelector(".club-boost__top"), 'innerHTML', clubBoostTop);
    }
    updateElement(dom.querySelector(".club-boost--content > :last-child"), 'innerHTML', clubBoostInner);
}

function updateElement(element, property, newValue) {
    if (element) {
        let currentValue;
        if (property === 'innerHTML' || property === 'innerText') {
            currentValue = element[property];
            newValue = newValue[property];
        }
        else if (property === 'src') {
            currentValue = element.getAttribute(property);
        }
        if (currentValue !== newValue) {
            if (property === 'src') {
                element.setAttribute(property, newValue);
            } else {
                element[property] = newValue;
            }
        }
    }
}

function recieveCard(cards, src) {
    let card = cards.find(card => card.src === src && card.lock === "unlock")
    if (card) {
        return card
    }
    card = cards.find(card => card.src === src && card.lock === "lock")
    if (card) {
        return card;
    }
}

window.addEventListener('update-page-extension', async (event) => {
    const button = document.querySelector(".club__boost-btn")
    if (button && autoBoost) {
        const cardId = button.getAttribute("data-card-id")
        const clubId = button.getAttribute("data-club-id")
        const res = await Fetch.boostCard(cardId, clubId)
        switchStatus(res)
    }
});

function switchStatus(res) {
    console.log("Boost Response:", res)
    if (res.error) {
        switch (res.error) {
            case "Достигнут дневной лимит пожертвований в клуб, подождите до завтра":
                switcherAutoBoost.turnOff()
                switcherAutoUnlock.turnOff()
                break;
        }
    }
    else if (res.reloud) {

    }
    else if (res.status) {
        countBoost++
        switcherAutoBoost.text(`Auto Boost Card (${countBoost})`)
    }
}

let countBoost = 0
const switcherAutoBoost = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {
            autoBoost = isChecked
        }
    }
)
switcherAutoBoost.disable()
switcherAutoBoost.text(`Auto Boost Card (${countBoost})`)

const switcherAutoUnlock = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {
            autoUnlock = isChecked
        }
    }
)
switcherAutoUnlock.disable()
switcherAutoUnlock.text("Auto Unlock Card")

const switcherUpdatePage = new Switcher(
    {
        checked: false,
        onChange: (isChecked) => {

            if (isChecked) {
                switcherAutoBoost.enable()
                switcherAutoUnlock.enable()
                stopUpdating = false;
                pageUpdateInfo();
            } else {
                switcherAutoBoost.turnOff()
                switcherAutoBoost.disable()
                switcherAutoUnlock.turnOff()
                switcherAutoUnlock.disable()
                stopUpdating = true;
                clearInterval(intervalId);
            }
        }
    }
)
switcherUpdatePage.text("Auto Page Info Update")

switcherUpdatePage.place(".club-boost__owners")
switcherAutoBoost.place(".club-boost__owners")
// switcherAutoUnlock.place(".club-boost__owners")

