function getCards(dom) {
    const array = dom.querySelector(".anime-cards.anime-cards--full-page");
    const childrens = Array.from(array.children);
    const cards = new CardsArray(childrens.map(element => {
        const card = new Card(element)
        card.fixImage
        card.fixLockIcon
        
        return card
    }))

    
    return cards
}

async function cardFinder(url) {
    const cardsList = new CardsArray();
    const dom = await parseFetch(url)
    cardsList.push(...getCards(dom));
    const panel = dom.querySelector('.pagination__pages')
    if (panel) {
        const pageUrls = Array.from(panel.querySelectorAll(':scope > a')).map(element => element.href);
        
        const pagePromises = pageUrls.map(async (url) => {
            const dom = await parseFetch(url);
            return getCards(dom);
        });

        const pagesCards = await Promise.all(pagePromises);
        pagesCards.forEach(cards => cardsList.push(...cards));
    }
    return cardsList;
}

async function GetAndRateUsersCards({ userUrl, userName, rank }) {
    const cards = new CardsArray();
    const cardUrl = UserUrl + '/cards/?rank=' + rank;
    const notNeededCardUrl = UserUrl + '/cards/trade/?rank=' + rank;

    cards = await cardFinder(cardUrl);
    cards.forEach(card => {
        card.userName = userName
        card.url = userUrl
    })
    cards.setRateByLock()

    cards.forEach(card => {
        const clonedCard = cloneCard(card);
        const { lock, img } = getCardData(card);
        let rate;
        switch (lock) {
            case "lock":
                rate = 0;
                break;
            case "unlock":
                rate = 1;
                break;
            case "trade":
                rate = 0.5;
                break;
            default:
                rate = 0;
        }
        data.push({ card: clonedCard, rate, img, UserName });
    });

    cards = await cardFinder(notNeededCardUrl);
    cards.forEach(card => {
        const { img: cardImg } = getCardData(card);

        data.map(element => {
            const { card, rate, img } = element;
            if (img === cardImg) {
                element.rate = rate + 1;
            }
        });
    });
    return data;
}

async function getMyCards(rank) {
    const menu = document.querySelector(".login__content.login__menu")
    const urls = menu.querySelectorAll("a")

    const urlsArray = Array.from(urls);
    for (const element of urlsArray) {
        if (element.href.endsWith("/cards/")) {
            const UserUrl = element.href.replace("/cards/", "");
            const cards = await GetAndRateUsersCards({ UserUrl, rank });
            return cards;
        }
    }
}
