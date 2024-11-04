async function showCards() {
    const showBar = createShowBar();
    const usersList = getUsersList();
    const cards = [];
    for (let user of usersList) {
        const data = await checkUserCards(user);
        cards.push(...data);
    }
    cards.sort((a, b) => b.rate - a.rate);
    console.log(cards);
    cards.forEach(card => {
        showBar.appendChild(card.element);
    });
}

function getUsersList() {
    const usersList = [];
    const users = document.querySelector('.profile__friends.profile__friends--full');
    const children = users.children;
    Array.from(children).forEach(element => {
        const UserURL = element.href
        const UserName = element.querySelector('.profile__friends-name').textContent;
        usersList.push({
            UserURL,
            UserName
        });
    });
    return usersList;
}


async function checkUserCards(user) {
    const { UserURL, UserName } = user;
    const sCardUrl = UserURL + '/cards/?rank=s'
    const noNeedCardUrl = UserURL + '/cards/trade/?rank=s'
    const sCardDOM = await parseFetch(sCardUrl);
    const array = sCardDOM.querySelector(".anime-cards.anime-cards--full-page");
    const childrenArray = Array.from(array.children);
    const data = [];
    Array.from(childrenArray).forEach(element => {

        const clonedElement = element.cloneNode(true);

        // Add image to card
        const imgDIV = clonedElement.querySelector('.anime-cards__image').querySelector('img')
        const imgSRC = imgDIV.getAttribute('data-src')
        imgDIV.setAttribute('src', imgSRC)

        // Fix lock icon
        const lockIcon = clonedElement.querySelector('.lock-trade-btn');
        if (lockIcon) {
            lockIcon.style.position = 'absolute';
            lockIcon.style.top = '10px';
            lockIcon.style.right = '10px';
        }
        // Add link to user profile
        const linkElement = document.createElement('a');
        linkElement.href = UserURL;
        linkElement.textContent = UserName;
        linkElement.style.display = 'block';
        linkElement.style.textAlign = 'center';
        clonedElement.querySelector('.anime-cards__item').appendChild(linkElement);

        data.push({element: clonedElement, rate: (!!lockIcon) ? 0 : 1});
    });

    const noNeedCardDOM = await parseFetch(noNeedCardUrl);
    const noNeedArray = noNeedCardDOM.querySelector(".anime-cards.anime-cards--full-page");
    const childrens = Array.from(noNeedArray.children);
    Array.from(childrens).forEach(element => {
        const imgDIV = element.querySelector('.anime-cards__image').querySelector('img')
        const imgSRC = imgDIV.getAttribute('data-src')
        data.map(card => {
            if (card.element.querySelector('.anime-cards__image').querySelector('img').getAttribute('data-src') === imgSRC) {
                card.rate = 2;
                card.element.querySelector('.anime-cards__item').style.backgroundColor = 'green';
            }
        });
    });
    return data;
}



async function parseFetch(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(text, 'text/html');
    return htmlDocument;
}

function createShowBar() {
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
    return showBar;
}

function init() {
    const tabsDiv = document.querySelector('.tabs.tabs--center.mb-2');
    if (tabsDiv) {
        const buttonContainer = document.createElement('div');
        const button = document.createElement('button');
        button.textContent = 'Show S Cards';
        button.className = 'button--primary';
        button.style = 'margin-left: 10px;';
        button.addEventListener('click', showCards);
        buttonContainer.appendChild(button);
        tabsDiv.appendChild(buttonContainer);
    }
}

init();