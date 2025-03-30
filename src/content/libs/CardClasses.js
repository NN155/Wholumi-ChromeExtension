class Card {
    constructor(card = null) {
        this.card = card;
        this.cardInfo
        this.url;
        this.src;
        this.userName;
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
        }
        if (this.isRemeltCard() || this.card.classList.contains('card-filter-list__card')) {
            this.src = this.card.querySelector("img").getAttribute('src');
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
    }
    async unlockCard() {
        if (this.lock === "lock") {
            await Fetch.unlockCard(this.id);
        }
    }

    async lockCard() {
        if (this.lock !== "lock") {
            await Fetch.unlockCard(this.id);
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

class CardsArray extends Array {
    sort(sortByNeedCountAsc = false) {
        super.sort((a, b) => {
            if (b.sortPriority !== a.sortPriority) {
                return b.sortPriority - a.sortPriority;
            }
            if (b.rate !== a.rate) {
                return b.rate - a.rate;
            }
            if (b.cardId !== a.cardId) {
                return b.cardId - a.cardId;
            }
            return sortByNeedCountAsc ? a.needCount - b.needCount : b.needCount - a.needCount;
        });
    }

    getLockedCards() {
        return new CardsArray(...super.filter(card => card.lock === "lock"));
    }

    getCardsArray() {
        const arr = [];
        this.forEach(card => arr.push(card.card));
        return arr;
    }

    filter(callback) {
        const filtered = super.filter(callback);
        
        this.length = 0;
        
        for (let i = 0; i < filtered.length; i++) {
            this[i] = filtered[i];
        }
        
        return this
    }
    clone() {
        return new CardsArray(...this);
    }

    random() {
        return this[Math.floor(Math.random() * this.length)];
    }

    min(field) {
        return this.reduce((min, card) => (card[field] < min[field] ? card : min), this[0]);
    }

    max(field) {
        return this.reduce((max, card) => (card[field] > max[field] ? card : max), this[0]);
    }
    
    Filter(callback) {
        const filtered = super.filter(callback);
        const newCardsArray = new CardsArray(...filtered);
        return newCardsArray;
    }
}

class HashCards {
    constructor() {
        this.hash = {};
    }

    add(card) {
        this.hash[card.src] = (this.hash[card.src] || 0) + 1;
    }

    remove(card) {
        this.removeBySrc(card.src);
    }

    removeBySrc(src) {
        if (this.hash[src]) {
            this.hash[src]--;
            if (this.hash[src] === 0) {
                delete this.hash[src];
            }
        }
    }

    has(card) {
        return this.hasBySrc(card.src);
    }

    hasBySrc(src) {
        return this.hash[src] > 0;
    }

    get length() {
        return Object.keys(this.hash).length;
    }
}

class User {
    constructor({userName, userUrl, online, lock } = {}) {
        this.userName = userName;
        this.userUrl = userUrl;
        this.online = online;
        this.lock = lock;
    }
}

class UsersArray extends Array {
    getOnlineUsers() {
        return this.filter(user => user.online);
    }

    getUnlockedUsers() {
        return this.filter(user => user.lock === "unlock");
    }
}