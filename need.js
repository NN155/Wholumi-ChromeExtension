async function showCards({ rank, src }) {
    ShowBar.createShowBar();
    const usersList = await getUsersList();
    const usersCards = await findUsersCards(usersList, user => checkUserCards(user, rank));
    const myUrl = UrlConstructor.getMyUrl();
    const my = new GetCards({ userUrl: myUrl, rank });
    const myInventoryCards = await my.getInventory();
    const myNeedCards = await my.getNeed();
    myInventoryCards.forEach(card => {
        card.setId();
        card.setLock();
    });
    upPriority(usersCards, myNeedCards);
    usersCards.sortByRate();
    usersCards.forEach(card => {
        card.fixCard()
        card.fixLockIcon()
        card.addLink()
        card.setColorByRate()
        card.setId()
    })
    const myCard = getCardBySrc(myInventoryCards, src);
    changeCards(usersCards, myCard);
    ShowBar.addElementsToBar(usersCards.getCardsArray());
}

function upPriority(cards, myNeedCards) {
    cards.forEach(card => {
        if (myNeedCards.find(myCard => myCard.src === card.src)) {
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
                button.addEventListener('click', async () => {
                await trade(card, myCard);
                });
            }
        })
    })
}


async function checkUserCards(user, rank = "s") {
    const { userUrl, userName } = user;
    const cards = await getInventoryTrade({ userUrl, userName, rank });
    return cards;
}

async function init() {
    const dom = await getDomCardRAnk();
    const { rank, src } = await getCardInfo(dom);
    const text = `Show ${rank} Cards`;
    const button = new Button();
    button.text(text);
    button.place(".tabs.tabs--center.mb-2");
    button.addEventListener('click', () => showCards({ rank, src }));
}

init();