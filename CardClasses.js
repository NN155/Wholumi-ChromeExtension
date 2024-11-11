class Card {
    constructor(card = null) {
        this.card = card;
        this.url = null;
        this.src = null;
        this.userName = null;
        this.lock = null;
        this._img = null;
        this.rate = 0;
        this.id = null;
        this.sortPriority = 0;
    }

    setSrc() {
        this._img = this.card.querySelector('.anime-cards__image').querySelector('img');
        this.src = this._img.getAttribute('data-src');
    }

    fixImage() {
        if (!this.src) {
            this.setSrc();
        }
        this._img.setAttribute('src', this.src);
    }
    fixLockIcon() {
        const lockIcon = this.card.querySelector('.lock-trade-btn') || this.card.querySelector('.lock-card-btn');
        if (lockIcon) {
            lockIcon.style.position = 'absolute';
            lockIcon.style.top = '10px';
            lockIcon.style.right = '10px';
        }
    }
    removeBorderds() {
        const cardItem = this.card.querySelector('.anime-cards__item');
        cardItem.classList.remove('anime-cards__owned-by-user');
    }
    fixCard() {
        this.fixImage();
        this.fixLockIcon();
    }

    addLink() {
        if (!this.userName || !this.url) {
            return;
        }
        const linkElement = document.createElement('a');
        linkElement.href = this.url;
        linkElement.textContent = this.userName;
        linkElement.style.display = 'block';
        linkElement.style.textAlign = 'center';
        this.card.querySelector('.anime-cards__item').appendChild(linkElement);
    }
    
    setLock() {
        if (this.card.querySelector('.lock-card-btn')) {
            this.lock = "unlock";
            if (this.card.querySelector('.fa-lock')) {
                this.lock = "lock";
            } else if (this.card.querySelector('.fa-arrow-right-arrow-left')) {
                this.lock = "trade";
            }
        } else {
            const lockIcon = this.card.querySelector('.lock-trade-btn');
            this.lock = lockIcon ? "lock" : "unlock";
            if (lockIcon && (this.card.querySelector('.fa-exchange') || this.card.querySelector('.fa-arrow-right-arrow-left'))) {
                this.lock = "trade";
            }
        }
    }

    addLockIcon() {
        if (this.lock === "unlock" && this.card.rate > 0) {
            return;
        }

        const div = document.createElement('div');
        if (this.rate < 0) {
            div.classList.add('lock-card-btn');
        }
        else {
            div.classList.add('lock-trade-btn');
        }
        div.style.display = 'block';
        const i = document.createElement('i');
        switch (this.lock) {
            case "lock":
                i.classList.add('fal', 'fa-lock');
                break;
            case "trade":
                i.classList.add('fal', 'fa-exchange');
                break;
            default:
                i.classList.add('fal', 'fa-lock');
        }
        if (this.rate < 0) {
            i.style.color = 'red';
            i.fontSize = '20px';
        }

        div.appendChild(i);
        const cardItem = this.card.querySelector('.anime-cards__item');
        cardItem.appendChild(div);
    }

    setColor(color) {
        this.card.querySelector('.anime-cards__item').style.backgroundColor = color;
    }


    setRateByLock() {
        switch (this.lock) {
            case "lock":
                this.rate = 0
                break;
            case "unlock":
                this.rate = 1
                break;
            case "trade":
                this.rate = 0.5
                break;
            default:
                this.rate = 0;
        }
    }

    setColorByRate() {
        switch (this.rate) {
            case 0:
                this.setColor(globalColors.red);
                break
            case 0.5:
                this.setColor(globalColors.darkRed);
                break;
            case 1:
                break;
            case 1.5:
                this.setColor(globalColors.darkGreen);
                break;
            case 2:
                this.setColor(globalColors.green);
                break;
            default:
                this.setColor(globalColors.black);
        }
    }

    changeLockIconByRate() {
        if (this.rate < 0) {
            this.changetLockIcon();
        }
    }

    setId() {
        const card = this.card.querySelector(".anime-cards__item")
        if (card) {
        this.id = card.getAttribute('data-owner-id');
        }
        else {
            this.id = this.card.getAttribute('data-id');
        }
    }
    
    async unlock() {
        if (this.lock === "lock") {
            await fetch('/engine/ajax/controller.php?mod=cards_ajax', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    mod: "cards_ajax",
                    action: "lock_card",
                    id: this.id,
                })
            })
        }
    }
    addEventListener(event, callBack) {
        this.card.addEventListener(event, callBack)
    }

    setBorder(color) {
        this.card.querySelector('.anime-cards__item').style.border = `2px solid ${color}`;
    }
}

class CardsArray {
    constructor(cards = []) {
        this.cards = cards;
    }

    push(...array) {
        this.cards.push(...array)
    }

    forEach(callBack) {
        this.cards.forEach(callBack)
    }

    map(callBack) {
        this.cards = this.cards.map(callBack)
    }

    filter(callBack) {
        this.cards = this.cards.filter(callBack)
    }

    find(callBack) {
        return this.cards.find(callBack)
    }

    getCardsArray() {
        const cardsArray = []
        this.forEach(element => cardsArray.push(element.card))
        return cardsArray;
    }

    sortByRate() {
        this.cards.sort((a, b) => {
            if (b.rate !== a.rate) {
                return b.rate - a.rate;
            }
            return b.sortPriority - a.sortPriority;
        });
    }

    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.cards.length) {
                    return {
                        value: this.cards[index++],
                        done: false
                    }
                } else {
                    return {
                        done: true
                    }
                }
            }
        }
    }
    length() {
        return this.cards.length;
    }
    getLockedCards() {
        const cards = new CardsArray();
        this.forEach(card => {
            if (card.lock === "lock") {
                cards.push(card);
            }
        });
        return cards;
    }
}