let autoBoost = false;
let autoUnlock = false;

async function pageUpdateInfo() {
    const url = window.location.href
    const dom = await Fetch.parseFetch(url)
    const data = getPageInfo(dom)
    updatePageInfo(document, data)

    const event = new CustomEvent("update-page-extension", { detail: data });
    window.dispatchEvent(event);
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
    const data = event.detail
    const { src, clubBoostInner } = data
    const link = clubBoostInner?.querySelector("a")
    if (data && autoBoost && link) {
        const url = link.href
        const my = new GetCards({ rank: null, userUrl: null, userName: "My" })
        const cards = await my.getAllCards(url)
        let card = recieveCard(cards, src)
        if (card) {
            let boostBool = card.lock === "unlock"
            if (autoUnlock && !boostBool) {
                await Fetch.unlockCard(card.id)
                boostBool = true
            }
            if (boostBool) {
                const res = await Fetch.boostCard(card.cardId)
                switchStatus(res)
            }
        }
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
    else {
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
                intervalId = setInterval(pageUpdateInfo, 2000);
            } else {
                switcherAutoBoost.turnOff()
                switcherAutoBoost.disable()
                switcherAutoUnlock.turnOff()
                switcherAutoUnlock.disable()
                clearInterval(intervalId);
            }
        }
    }
)
switcherUpdatePage.text("Auto Page Info Update")

switcherUpdatePage.place(".club-boost__owners")
switcherAutoBoost.place(".club-boost__owners")
switcherAutoUnlock.place(".club-boost__owners")

