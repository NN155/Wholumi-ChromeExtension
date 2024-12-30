async function showCards({ rank, src, input }) {
    ShowBar.createShowBar();
    
    const userName = input.getValue();
    const myUrl = userName ? UrlConstructor.getUserUrl(userName) : UrlConstructor.getMyUrl();
    const my = new GetCards({ userUrl: myUrl, rank });
    let myInventoryCards, myNeedCards;
    try {
        [myInventoryCards, myNeedCards] = await Promise.all([
            my.getInventory(),
            my.getNeed()
        ]);
    }
    catch {
        ShowBar.text("User not found");
        return;
    }

    const myCard = getCardBySrc(myInventoryCards, src);

    const usersList = await getUsersList(document, {
        limit:1000, 
        pageLimit:10,
    });
    const usersCards = await findUsersCards(usersList, user => checkUserCards(user, rank));
    usersCards.forEach(card => {
        card.fixCard()
        card.fixLockIcon()
        card.addLink()
        card.setColorByRate()
        card.removeButton();
    })
    if (userName) {
        addOrangeBorder(usersCards, myInventoryCards);
    }
    upPriority(usersCards, myNeedCards);
    changeCards(usersCards, myCard);
    if (usersCards.length() > 150) {
        usersCards.filter(card => card.rate > 0);
    }
    usersCards.sort();

    ShowBar.addElementsToBar(usersCards.getCardsArray());
}

function upPriority(cards, myNeedCards) {
    cards.forEach(card => {
        if (myNeedCards.find(myCard => myCard.cardId === card.cardId)) {
            card.sortPriority = 1;
            card.setBorder(globalColors.purple);
        }
    })
}

function changeCards(usersCards, myCard) {
    usersCards.forEach(card => {
        card.addEventListener('click', () => {
            const button = new Button();
            let text;
            if (!myCard) {
                text = "In trade or not found";
                button.disable();
            }
            else if (card.lock !== "unlock") {
                text = "This card is locked";
                button.disable();
            }
            else {
                text = `${myCard.lock === "lock" ? "Unlock and ": ""}Trade`
            }
            button.text(text);
            button.place(".anime-cards__controls")
            if (myCard) {
                button.onclick = async () => {
                await trade(card, myCard);
                }
            }
        })
    })
}


async function checkUserCards(user, rank = "s") {
    const { userUrl, userName } = user;
    const cards = await getInventoryTrade({ userUrl, userName, rank });
    return cards;
}

function addOrangeBorder(cards, myCards) {
    cards.forEach(card => {
        card.removeBorderds();
        if (myCards.find(myCard => myCard.cardId === card.cardId)) {
            card.setBorder(globalColors.orange);
        }
    })
}

async function init() {
    const button = new Button();
    const input = new Input();
    const dom = await getDomCardRank();
    const { rank, src } = await getCardInfo(dom);
    const text = `Show ${rank} Cards`;
    button.text(text);
    input.text(UrlConstructor.getMyName());
    button.onclick = () => showCards({ rank, src, input });
    await button.place(".tabs.tabs--center.mb-2");
    input.place(".tabs.tabs--center.mb-2");
}

init();