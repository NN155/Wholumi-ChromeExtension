function cloneCard(card) {
    return card.cloneNode(true);
}

function fixCard(card) {
    const imgDIV = card.querySelector('.anime-cards__image').querySelector('img')
    const imgSRC = imgDIV.getAttribute('data-src')
    imgDIV.setAttribute('src', imgSRC)

    const lockIcon = card.querySelector('.lock-trade-btn');
    if (lockIcon) {
        lockIcon.style.position = 'absolute';
        lockIcon.style.top = '10px';
        lockIcon.style.right = '10px';
    }
}

function addLinkToCard({ card, UserURL, UserName }) {
    const linkElement = document.createElement('a');
    linkElement.href = UserURL;
    linkElement.textContent = UserName;
    linkElement.style.display = 'block';
    linkElement.style.textAlign = 'center';
    card.querySelector('.anime-cards__item').appendChild(linkElement);
}

function getCardData(card) {
    const img = card.querySelector('.anime-cards__image').querySelector('img').getAttribute('data-src');
    if (card.querySelector('.lock-card-btn')) {
        let lock = "unlock";

        if (card.querySelector('.fa-lock')) {
            lock = "lock";
        } else if (card.querySelector('.fa-arrow-right-arrow-left')) {
            lock = "trade";
        }
        return { img, lock };
    } else {
        const lockIcon = card.querySelector('.lock-trade-btn');
        let lock = lockIcon ? "lock" : "unlock";
        if (lockIcon && (card.querySelector('.fa-exchange') || card.querySelector('.fa-arrow-right-arrow-left'))) {
            lock = "trade";
        }
        return { img, lock };
    }
}

function setCardColor(card, color) {
    card.querySelector('.anime-cards__item').style.backgroundColor = color;
}

function allModifiedCard({ card, rate, UserUrl, UserName }) {
    card = cloneCard(card);
    fixCard(card);
    addLinkToCard({ card, UserUrl, UserName });
    switch (rate) {
        case 0:
            setCardColor(card, globalColors.red);
            break
        case 0.5:
            setCardColor(card, globalColors.darkRed);
            break;

        case 1.5:
            setCardColor(card, globalColors.darkGreen);
            break;
        case 2:
            setCardColor(card, globalColors.green);
            break;
    }

    return card;
}