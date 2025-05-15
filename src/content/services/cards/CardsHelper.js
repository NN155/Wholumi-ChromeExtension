/**
 * Get a card by source URL and lock status
 */
function getCardBySrc(cards, src) {
    let card;
    card = cards.find(card => card.src === src && card.lock === "unlock");
    if (card) {
        return card;
    }
    card = cards.find(card => card.src === src && card.lock === "lock");
    return card;
}

/**
 * Execute a trade with a card
 */
async function trade(card, tradeCard) {
    if (tradeCard.lock === "lock") {
        await tradeCard.unlockCard();
    }
    window.location.href = UrlConstructor.tradeLink(card.id, tradeCard.id);
}

/**
 * Add event listeners to cards to enable trade functionality
 */
function changeCards(cards) {
    cards.forEach(card => {
        card.addEventListener('click', async () => {
            let text;
            let disabled = false;

            if (!card.tradeCard.id) {
                text = "Your card is not found";
                disabled = true;
            }

            else if (card.tradeCard.lock === "trade") {
                text = "Your card is in trade";
                disabled = true;
            }

            else if (card.tradeCard.lock === "trophy") {
                text = "Your card is locked";
                disabled = true;
            }

            else if (card.lock === "trade") {
                text = "This card is in trade";
                disabled = true;
            }
            else if (card.lock === "lock" || card.lock === "trophy") {
                text = "This card is locked";
                disabled = true;
            }

            else {
                text = `${card.tradeCard.lock === "lock" ? "Unlock and " : ""}Trade`
            }

            const button = new Button({
                disabled,
                text,
                onClick: async () => {
                    await trade(card, card.tradeCard);
                }
            });
            await button.asyncPlaceAfter(".anime-cards__link")
        })
    })
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

function addOrangeBorder(otherCards, userCards) {
    otherCards.forEach(otherCard => {
        otherCard.removeBorderds();
        if (userCards.find(userCard => userCard.compare(otherCard))) {
            otherCard.dubles = 1;
            otherCard.setBorder(globalColors.orange);
        } else {
            otherCard.dubles = 0;
        }
    })
}