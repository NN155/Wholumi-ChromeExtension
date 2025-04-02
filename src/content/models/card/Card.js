class Card {
    constructor(card = null) {
        this.card = card;
        this.cardInfo
        this.url;
        this.src;
        this.username;
        this.lock;
        this.rate = 0;
        this.id;
        this.sortPriority = 0;
        this.cardId;
        this.name;
        this.dubles = 0;
        this.searchLink;
        this.tradeLink;
        this.mp4;
        this.webm;
        this.rank;
        this.animeName;
        this.needCount;
        this.online;
        this.tradeId;
        this.tradeLock;
        this.tradeCardId;
    }

    setSrc() {
        let card;
        card = this.card.querySelector('.anime-cards__item');
        if (card) {
            this.src = card.getAttribute('data-image');
            return;
        } else {
            this.src = this.card.querySelector("img").getAttribute('data-src') || this.card.querySelector("img").getAttribute('src');
            return;
        }
    }

    setVideoData() {
        this.mp4 = this.card.querySelector('.anime-cards__item').getAttribute('data-mp4') || null;
        this.webm = this.card.querySelector('.anime-cards__item').getAttribute('data-webm') || null;
    }
    fixImage() {
        const card = this.card.querySelector('.anime-cards__item');
        if (card) {
            this.card.querySelector("img").setAttribute('src', this.src);
        }
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
        if (!this.username || !this.url) {
            return;
        }
        const linkElement = document.createElement('a');
        linkElement.href = this.url;
        linkElement.textContent = this.username;
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
            } else if (this.card.querySelector('.fa-trophy-alt')) {
                this.lock = "trophy";
            }

        } else if (this.isRemeltCard()) {
            this.lock = "unlock";
            if (this.card.classList.contains('remelt__inventory-item--lock')) {
                this.lock = "lock";
            } else if (this.card.classList.contains('remelt__inventory-item--not-available')) {
                this.lock = "trade";
            }
        } else {
            const lockIcon = this.card.querySelector('.lock-trade-btn');
            this.lock = lockIcon ? "lock" : "unlock";
            if (lockIcon && this.card.querySelector('.fa-exchange')) {
                this.lock = "trade";
            } else if (lockIcon && this.card.querySelector('.fa-trophy-alt')) {
                this.lock = "trophy";
            }
        }
    }

    addLockIcon(lock = this.lock) {
        if (lock === "unlock") {
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
        switch (lock) {
            case "lock":
                i.classList.add('fal', 'fa-lock');
                break;
            case "trade":
                i.classList.add('fal', 'fa-exchange');
                break;
            case "trophy":
                i.classList.add('fal', 'fa-trophy-alt');
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
                this.rate = 0;
                break;
            case "unlock":
                this.rate = 1;
                break;
            case "trade":
                this.rate = 0.5;
                break;
            case "trophy":
                this.rate = 0;
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
                this.setBorder(globalColors.red);
                this.setColor(globalColors.black);
        }
    }

    setId() {
        const card = this.card.querySelector(".anime-cards__item") || (this.card.classList.contains('card-filter-list__card') ? this.card : null);
        if (card) {
            this.id = card.getAttribute('data-owner-id');
        } else {
            this.id = this.card.getAttribute('data-id');
        }
    }
    setCardId() {
        const card = this.card.querySelector(".anime-cards__item") || this.card;
        this.cardId = card.getAttribute('data-id');
        if (!this.cardId) {
            card.querySelector('a')
            this.cardId = card.querySelector('a').getAttribute('href').split('/')[2];
        }
    }
    async unlockCard() {
        if (this.lock === "lock") {
            await FetchService.unlockCard(this.id);
        }
    }

    async lockCard() {
        if (this.lock !== "lock") {
            await FetchService.unlockCard(this.id);
        }
    }
    addEventListener(event, callBack) {
        this.card.addEventListener(event, callBack)
    }

    setBorder(color) {
        this.card.querySelector('.anime-cards__item').style.border = `2px solid ${color}`;
    }
    removeButton() {
        const button = this.card.querySelector('.card-offer-remove-btn');
        if (button) {
            button.remove();
        }
    }

    setName() {
        const card = this.card.querySelector('.anime-cards__item') || this.card;
        if (card) {
            this.name = card.getAttribute('data-name');
        }
    }
    setAnimeName() {
        const card = this.card.querySelector('.anime-cards__item') || this.card;
        if (card) {
            this.animeName = card.getAttribute('data-anime-name');
        }
    }
    setRank() {
        const card = this.card.querySelector('.anime-cards__item') || this.card;
        if (card) {
            this.rank = card.getAttribute('data-rank');
        }
    }

    isRemeltCard() {
        return this.card.classList.contains('remelt__inventory-item');
    }

    transformToCard() {
        this.card = createCard(this);
    }

    clone() {
        const newCard = new Card(this.card.cloneNode(true));
        Object.assign(newCard, this);
        return newCard;
    }

    setDubles() {
        const card = this.card.querySelector('.anime-cards__item');
        if (card) {
            this.dubles = card.classList.contains('anime-cards__owned-by-user') ? 1 : 0;
        }
    }

    pulsing(shouldPulse = true) {
        const card = this.card;
        if (card.classList.contains('pulsing')) {
            if (!shouldPulse) {
                card.classList.remove('pulsing');
            }
            return;
        } else {
            if (shouldPulse) {
                card.classList.add('pulsing');
            }
            return;
        }
    }

    addClass(className) {
        if (!this.card.classList.contains(className)) {
            this.card.classList.add(className);
        }
    }
    removeClass(className) {
        if (this.card.classList.contains(className)) {
            this.card.classList.remove(className);
        }
    }
    hasClass(className) {
        return this.card.classList.contains(className);
    }
}