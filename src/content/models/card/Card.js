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
        this._tradeCard;
        this._htmlType;
    }
    
    get tradeCard() {
        if (this._tradeCard) return this._tradeCard;
        this._tradeCard = new Card();
        return this._tradeCard;
    }

    get htmlType() {
        if (this._htmlType) return this._htmlType;

        if (this.card.querySelector('.anime-cards__item')) {
            this._htmlType = 'normal';
            return this._htmlType;
        }

        if (this.card.classList.contains('card-filter-list__card')) {
            this._htmlType = 'filter';
            return this._htmlType;
        }

        if (this.card.classList.contains('remelt__inventory-item')) {
            this._htmlType = 'remelt';
            return this.htmlType;
        }

        if (this.card.classList.contains('trade__inventory-item')) {
            this._htmlType = 'trade';
            return this.htmlType;
        }
    }

    setSrc() {
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector('.anime-cards__item');
                this.src = card.getAttribute('data-image');
                break;
            case 'filter':
            case 'remelt':
                this.src = this.card.querySelector("img").getAttribute('data-src') || this.card.querySelector("img").getAttribute('src');
                break;
        }
    }

    setVideoData() {
        this.mp4 = this.card.querySelector('.anime-cards__item').getAttribute('data-mp4') || null;
        this.webm = this.card.querySelector('.anime-cards__item').getAttribute('data-webm') || null;
    }

    fixImage() {
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector('.anime-cards__item');
                if (card) {
                    this.card.querySelector("img")?.setAttribute('src', this.src);
                }
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

        } else if (this.htmlType === 'remelt') {
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
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector(".anime-cards__item")
                this.id = card.getAttribute('data-owner-id');
                break;
            case 'filter':
            case 'remelt':
            case 'trade':
                this.id = this.card.getAttribute('data-id');
                break;
        }
    }

    setCardId() {
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector(".anime-cards__item")
                this.cardId = card.getAttribute('data-id');
                break;
            case 'trade':
                this.cardId = this.card.getAttribute('data-card-id');
                break;

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
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector('.anime-cards__item');
                this.name = card.getAttribute('data-name');
                break;
            case 'filter':
            case 'remelt':
                this.name = this.card.getAttribute('data-name');
                break;
        }
    }

    setAnimeName() {
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector('.anime-cards__item');
                this.animeName = card.getAttribute('data-anime-name');
                break;
            case 'filter':
            case 'remelt':
                this.animeName = this.card.getAttribute('data-anime-name');
                break;
        }
    }
    setRank() {
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector('.anime-cards__item');
                this.rank = card.getAttribute('data-rank');
                break;
            case 'filter':
            case 'remelt':
                this.rank = this.card.getAttribute('data-rank');
                break;
        }
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
        switch (this.htmlType) {
            case 'normal':
                const card = this.card.querySelector('.anime-cards__item');
                this.dubles = card.classList.contains('anime-cards__owned-by-user') ? 1 : 0;
                break;
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

    compare(card) {
        if (this.cardId && card?.cardId) {
            return card.cardId === this.cardId;
        }

        if (this.src && card?.src) {
            try {
                const thisCardPattern = this._extractCardPattern(this.src);
                const otherCardPattern = this._extractCardPattern(card.src);
                if (thisCardPattern === otherCardPattern) {
                    if (card.cardId) this.cardId = card.cardId;
                    else if (this.cardId) card.cardId = this.cardId;

                    return true;
                }
                return false;
            } catch (error) {
                console.error("Error comparing card images:", error);
                return card.src === this.src;
            }
        }

        return false;
    }

    _extractCardPattern(src) {
        const match = src.match(/\/cards_image\/(\d+)\/([a-z]+)\/([^-]+)-/);
        if (match) {
            return `${match[1]}/${match[2]}/${match[3]}`;
        }
        return src;
    }
}