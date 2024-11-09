class Button {
    constructor() {
        this._buttonContainer = document.createElement('div');
        this.button = document.createElement('button');
        this.button.className = 'button--primary';
        this.button.style = 'margin-left: 10px;';
        this.button.style.userSelect = "none";
        this._buttonContainer.appendChild(this.button);
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

async function getDomCardRAnk() {
    const container = document.querySelector(".container");
    const cardUrl = container.querySelector(".secondary-title.text-center").querySelector("a").href;
    const dom = await parseFetch(cardUrl);
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
    return {rank, src};
}

function getUsers() {
    const usersList = [];
    const users = document.querySelector('.profile__friends.profile__friends--full') || document.querySelector('.card-show__owners');
    const children = users.children;
    Array.from(children).forEach(element => {
        const userUrl = element.href
        const div = element.querySelector('.profile__friends-name') || element.querySelector('.card-show__owner-name');
        const userName = div.textContent;
        const lockIcon = element.querySelector('.fa-lock') || element.querySelector('.fa-exchange') || element.querySelector('.fa-arrow-right-arrow-left');
        const lock = lockIcon ? "lock" : "unlock";
        usersList.push({
            userUrl,
            userName,
            lock
        });
    });
    return usersList;
}

async function getUsersList() {
    let usersList = getUsers();
    const pageUrls = findPanel(document);
    if (pageUrls) {
        const usersLists = await Promise.all(
            pageUrls.map(async (url) => {
                const dom = await parseFetch(url);
                return getUsers(dom);
            })
        );
        usersLists.forEach(users => usersList.push(...users));
    }

    if (usersList.length >= 200) {
        usersList = usersList.filter(user => user.lock !== "lock").slice(0, 200);
    }

    return usersList;
}


function findPanel(dom) {
    const panel = dom.querySelector('.pagination__pages')
    if (panel) {
        const pageUrls = Array.from(panel.querySelectorAll(':scope > a')).map(element => element.href);
        return pageUrls;
    }
}