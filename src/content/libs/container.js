class Button {
    constructor() {
        this.onclick = null
        this._buttonContainer = document.createElement('div');
        this.button = document.createElement('button');
        this.button.className = 'button--primary extension';
        this.button.style = 'margin-left: 10px;';
        this.button.style.userSelect = "none";
        this._buttonContainer.appendChild(this.button);
        this.button.onclick = this._onclick.bind(this);
    }
    async _onclick() {
        this.disable()
        try {
            this.onclick && await this.onclick();
        }
        finally {
            this.enable();
        }

    }

    addEventListener(event, func) {
        this.button.addEventListener(event, func);
    }
    async place(querySelector) {
        const tabsDiv = await this._waitDiv(querySelector)
        if (tabsDiv) {
            tabsDiv.appendChild(this._buttonContainer);
        }
    }
    text(text) {
        this.button.textContent = text;
    }

    disable() {
        this.button.disabled = true;
        this.button.style.cursor = 'not-allowed';
        this.button.style.opacity = '0.5';
        this.button.style.pointerEvents = 'none';
    }
    enable() {
        this.button.disabled = false;
        this.button.style.cursor = 'pointer';
        this.button.style.opacity = '1';
        this.button.style.pointerEvents = 'auto';
    }
    _waitDiv(querySelector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const intervalTime = 100;
            let elapsed = 0;

            const interval = setInterval(() => {
                const element = document.querySelector(querySelector);
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                } else if (elapsed >= timeout) {
                    clearInterval(interval);
                    reject(new Error(`Element ${querySelector} did not appear within ${timeout} ms`));
                }
                elapsed += intervalTime;
            }, intervalTime);
        });
    }
}

class ShowBar {
    constructor() {
        this.showBar = null;
    }

    static createShowBar() {
        let showBar = document.getElementById('show-bar');

        if (!showBar) {
            showBar = document.createElement('div');
            showBar.id = 'show-bar';
            showBar.style.width = '100%';
            showBar.style.marginTop = '50px';
            showBar.style.display = 'flex';
            showBar.style.flexWrap = 'wrap';
            showBar.style.justifyContent = 'space-around';
            const container = document.querySelector(".container") || document.querySelector('.card-show__name-wrapper');
            if (container) {
                container.appendChild(showBar);
            } else {
                console.error("Container element not found");
            }
        } else {
            while (showBar.firstChild) {
                showBar.removeChild(showBar.firstChild);
            }
        }
        this.showBar = showBar;
    }
    static addElementsToBar(elements) {
        if (elements.length === 0) {
            this.showBar.textContent = "No cards found";
        }
        else {
            elements.forEach(element => {
                this.showBar.appendChild(element);
            });
        }
    }
}

class Switcher {
    constructor({ checked = false, onChange = null } = {}) {
        this.checked = checked;
        this.onChange = onChange;

        this.element = this.createSwitch();
    }

    createSwitch() {
        const container = document.createElement('div');
        container.className = 'switch-component-extension';

        container.innerHTML = `
            <label class="switch-extension">
                <input type="checkbox" ${this.checked ? 'checked' : ''}>
                <span class="slider-extension round"></span>
                <span class="switch-label-text"></span>
            </label>
        `;

        const input = container.querySelector('input');
        input.addEventListener('change', (event) => {
            this.checked = event.target.checked;
            if (this.onChange) {
                this.onChange(this.checked);
            }
        });

        return container;
    }

    text(labelText) {
        const labelTextElement = this.element.querySelector('.switch-label-text');
        labelTextElement.innerText = labelText;
    }

    render() {
        return this.element;
    }

    place(querySelector) {
        const container = document.querySelector(querySelector);
        container.appendChild(this.element);
    }
    
    center() {
        this.element.style.margin = "10px"
        this.element.style.display = "flex"
        this.element.style.justifyContent = "center"
        this.element.style.alignItems = "center"
    }

    disable() {
        this.isDisabled = true;
        const input = this.element.querySelector('input');
        input.disabled = true;
        this.element.classList.add('disabled');
    }

    enable() {
        this.isDisabled = false;
        const input = this.element.querySelector('input');
        input.disabled = false;
        this.element.classList.remove('disabled');
    }

    turnOff() {
        const input = this.element.querySelector('input');
        input.checked = false;
        this.checked = false;
        if (this.onChange) {
            this.onChange(this.checked);
        }
    }

    turnOn() {
        const input = this.element.querySelector('input');
        input.checked = true;
        this.checked = true;
        if (this.onChange) {
            this.onChange(this.checked);
        }
    }
}

class Li {
    constructor(text) {
        this.onclick = null
        this.text = text
        this.li = document.createElement("li")
        this.li.textContent = text
        this._style()
        this.li.onclick = this._onclick.bind(this)
    }
    _style() {
        this.li.style.cursor = "pointer"
        this.li.style.color = "#772ce8"
    }
    place(querySelector) {
        const container = document.querySelector(querySelector)
        container.appendChild(this.li)
    }
    disable() {
        this.li.style.cursor = "default"
        this.li.onclick = () => {}
        this.li.style.color = "#4a2c8f"
    }
    enable() {
        this._style()
        this.li.onclick = this.funk
    }
    place(queryParams) {
        const container = document.querySelector(queryParams)
        container.appendChild(this.li)
    }
    async _onclick() {
        this.disable()
        try {
            this.onclick && await this.onclick();
        }
        finally {
            this.enable();
        }

    }
}

async function getDomCardRank() {
    const container = document.querySelector(".container");
    const cardUrl = container.querySelector(".secondary-title.text-center").querySelector("a").href;
    const dom = await Fetch.parseFetch(cardUrl);
    return dom;
}

async function getCardInfo(dom) {
    let rank = "s";
    const cardRank = dom.querySelector(".anime-cards__rank");

    const classList = Array.from(cardRank.classList);

    const rankClass = classList.find(cls => cls.startsWith('rank-'));

    const rankLetter = rankClass.split('-')[1];
    rank = rankLetter;
    const card = dom.querySelector(".card-show__image")
    const src = card.getAttribute("src");
    return { rank, src };
}

function getUsers(dom) {
    const usersList = [];
    const users = dom.querySelector('.profile__friends.profile__friends--full') || dom.querySelector('.card-show__owners');
    const children = users.children;
    Array.from(children).forEach(element => {
        const userUrl = element.href
        const div = element.querySelector('.profile__friends-name') || element.querySelector('.card-show__owner-name');
        const userName = div.textContent;
        const lockIcon = element.querySelector('.fa-lock') || element.querySelector('.fa-exchange') || element.querySelector('.fa-arrow-right-arrow-left');
        const lock = lockIcon ? "lock" : "unlock";
        const online = element.classList.contains("card-show__owner--online")
        usersList.push({
            userUrl,
            userName,
            lock,
            online,
        });
    });
    return usersList;
}

async function getUsersList(dom, { filterLock, filterOnline, limit = 200, pageLimit=5} = {}) {
    let usersList = getUsers(dom);
    let pageUrls = findPanel(dom)
    if (pageUrls) {
        pageUrls = pageUrls.slice(0, pageLimit);
        const usersLists = await Promise.all(
            pageUrls.map(async (url) => {
                const dom = await Fetch.parseFetch(url);
                return getUsers(dom);
            })
        );
        usersLists.forEach(users => usersList.push(...users));
    }
    if (usersList.length >= limit) {
        filterLock = true;
    }

    if (filterLock) {
        usersList = usersList.filter(user => user.lock !== "lock");
    }

    if (filterOnline) {
        usersList = usersList.filter(user => user.online);
    }

    if (usersList.length >= limit) {
        usersList = usersList.slice(0, limit);
    }

    return usersList;
}


function findPanel(dom) {
    const panel = dom.querySelector('.pagination__pages')
    if (panel) {
        let pageUrls = Array.from(panel.querySelectorAll(':scope > a')).map(element => element.href);
        if (pageUrls.length >= 10) {
            const lastUrl = pageUrls[pageUrls.length - 1];
            const regex = /(.*\/page\/)\d+(\/?.*)/;
            const match = lastUrl.match(regex);
            const baseBefore = match[1];
            const baseAfter = match[2];
            const countPage = parseInt(lastUrl.match(/\/page\/(\d+)\//)[1]);

            let newPageUrls = [];
            for (let i = 2; i <= countPage; i++) {
                newPageUrls.push(`${baseBefore}${i}${baseAfter}`);
            }
            pageUrls = newPageUrls;
        }
        return pageUrls;
    }
}

async function getCardTradeInfo(ownerId) {
    const url = `/cards/${ownerId}/trade`
    const dom = await Fetch.parseFetch(url);
    const tradeDiv = dom.querySelector(".cards--container");
    try {
        const info = {
            receiver: tradeDiv.getAttribute("data-receiver"),
            receiver_id: tradeDiv.getAttribute("data-receiver-id"),
            trade_id: tradeDiv.getAttribute("data-trade-id"),
            sender_foto: tradeDiv.getAttribute("data-sender-foto"),
            original_card: tradeDiv.getAttribute("data-original-id"),
        };
        return info;
    }
    catch (e) {
        console.log(e);
    }
    return false;
}

async function getActiveTrades() {
    const dom = await Fetch.parseFetch("/trades/offers/");

    const tradeItems = Array.from(dom.querySelectorAll(".trade__list-item"));
    const ids = [];
    for (const item of tradeItems) {
        let id = item.getAttribute("href").replace("/trades/offers/", "").replace("/", "");
        ids.push(id);
    }
    return ids;
}