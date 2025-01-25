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
        card.addEventListener('click', async () => {
            let text;
            let disabled = false;

            if (!myCard) {
                text = "In trade or not found";
                disabled = true;
            }
            else if (card.lock !== "unlock") {
                text = "This card is locked";
                disabled = true;
            }
            else {
                text = `${myCard.lock === "lock" ? "Unlock and ": ""}Trade`
            }

            const button = new Button({
                disabled,
                text,
                onClick: async () => {
                    await trade(card, myCard);
                }
            });

            await button.asyncPlace(".anime-cards__controls")
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
    const { searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");

    const dom = await getDomCardRank();
    const {rank, src} = await getCardInfo(dom);

    const text = `Show ${rank} Cards`;


    const input = new Input({
        text: UrlConstructor.getMyName(),
        display: anotherUserMode,
    });

    const button = new Button({
        text: text,
        onClick: () => showCards({rank, src, input}),
        place: ".tabs.tabs--center.mb-2",
        display: searchCards,
    });

    input.place(".tabs.tabs--center.mb-2");

    window.addEventListener('config-updated' , async () => {
        const {searchCards, anotherUserMode} = await ExtensionConfig.getConfig("functionConfig");
    
        button.display(searchCards);
        input.display(anotherUserMode);
    });
}

init();