function createButton(text, onClick) {
    const tabsDiv = document.querySelector('.tabs.tabs--center.mb-2');
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
            const container = document.querySelector(".container");
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

async function getCardRank() {
    let rank = "s";
    const container = document.querySelector(".container");
    const cardUrl = container.querySelector(".secondary-title.text-center").querySelector("a").href;
    const dom = await parseFetch(cardUrl);
    const cardRank = dom.querySelector(".anime-cards__rank");

    const classList = Array.from(cardRank.classList);

    const rankClass = classList.find(cls => cls.startsWith('rank-'));

    const rankLetter = rankClass.split('-')[1];
    rank = rankLetter;
    return rank;
}

function getUsersList() {
    const usersList = [];
    const users = document.querySelector('.profile__friends.profile__friends--full');
    const children = users.children;
    Array.from(children).forEach(element => {
        const UserUrl = element.href
        const UserName = element.querySelector('.profile__friends-name').textContent;
        usersList.push({
            UserUrl,
            UserName
        });
    });
    return usersList;
}