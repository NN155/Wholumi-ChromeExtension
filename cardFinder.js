function getCards(dom) {
    const array = dom.querySelector(".anime-cards.anime-cards--full-page");
    const childrens = Array.from(array.children);
    const cards = new CardsArray(childrens.map(element => {
        const card = new Card(element)
        card.setLock()
        card.setRateByLock()
        card.setSrc()
        return card
    }))
    return cards
}

async function cardFinder(url) {
    const cardsList = new CardsArray();
    const dom = await parseFetch(url)
    cardsList.push(...getCards(dom));
    const pageUrls = findPanel(dom);
    if (pageUrls) {
        const pagesCards = await Promise.all(
            pageUrls.map(async (url) => {
                const dom = await parseFetch(url);
                return getCards(dom);
            })
        );
        pagesCards.forEach(cards => cardsList.push(...cards));
    }
    return cardsList;
}

async function GetAndRateUsersCards({ userUrl, userName, rank }) {
    const cards = new CardsArray();
    const cardUrl = userUrl + '/cards/?rank=' + rank;
    const notNeededCardUrl = userUrl + '/cards/trade/?rank=' + rank;

    const [userCards, notNeededCards] = await Promise.all([
        cardFinder(cardUrl),
        cardFinder(notNeededCardUrl)
    ]);

    userCards.forEach(card => {
        card.userName = userName;
        card.url = userUrl;
    });
    cards.push(...userCards);

    notNeededCards.forEach(cardNotNeeded => {
        cards.forEach(card => {
            if (cardNotNeeded.src === card.src) {
                card.rate += 1;
            }
        });
    });

    return cards;
}


async function getMyCards(rank) {
    const menu = document.querySelector(".login__content.login__menu")
    const urls = menu.querySelectorAll("a")

    const urlsArray = Array.from(urls);
    for (const element of urlsArray) {
        if (element.href.endsWith("/cards/")) {
            const userUrl = element.href.replace("/cards/", "");
            const cards = await GetAndRateUsersCards({ userUrl, rank });
            return cards;
        }
    }
}

async function findUsersCards(usersList, callBack) {
    const usersCards = new CardsArray();
    const userCardsPromises = usersList.map(callBack);
    const userCardsResults = await Promise.all(userCardsPromises);
    userCardsResults.forEach(data => {
        usersCards.push(...data);
    });
    return usersCards;
}