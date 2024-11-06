function createButton(text, onClick) {
    const tabsDiv = document.querySelector('.tabs.tabs--center.mb-2') || document.querySelector('.tabs.tabs--center');
    if (tabsDiv) {
        const buttonContainer = document.createElement('div');
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'button--primary';
        button.style = 'margin-left: 10px;';
        button.addEventListener('click', onClick);
        buttonContainer.appendChild(button);
        tabsDiv.appendChild(buttonContainer);
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
async function getCardRank(dom) {
    let rank = "s";
    const cardRank = dom.querySelector(".anime-cards__rank");

    const classList = Array.from(cardRank.classList);

    const rankClass = classList.find(cls => cls.startsWith('rank-'));

    const rankLetter = rankClass.split('-')[1];
    rank = rankLetter;
    return rank;
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


    return usersList;
}


function findPanel(dom) {
    const panel = dom.querySelector('.pagination__pages')
    if (panel) {
        const pageUrls = Array.from(panel.querySelectorAll(':scope > a')).map(element => element.href);
        return pageUrls;
    }
}