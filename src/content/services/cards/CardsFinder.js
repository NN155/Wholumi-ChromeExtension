class CardsFinder {
    constructor({ id, userName, limit = 3000, pageLimit = 15 }) {
        this.id = id;
        this.userName = userName;
        this.userUrl;
        this.limit = limit;
        this.pageLimit = pageLimit;
        this.src = null;
        this.rank = null;
        this.userExist = false;
        this.mp4 = null;
        this.webm = null;
    }

    async setCardData() {
        const cardUrl = UrlConstructor.getCardUrl(this.id);
        const dom = await FetchService.parseFetch(cardUrl);
        try {
            const cardInfo = getCardInfo(dom);
            this.rank = cardInfo.rank;
            this.src = cardInfo.src;
            this.mp4 = cardInfo.mp4;
            this.webm = cardInfo.webm;
        } catch (error) { }
    }
    async checkUserExistence() {
        this.userName = await UrlConstructor.validateUser(this.userName);
        this.userUrl = UrlConstructor.getUserUrl(this.userName);
        this.userExist = this.userName !== null
    }

    async setData() {
        await Promise.all([this.setCardData(), this.checkUserExistence()]);
    }

    async setCardName() {
        this.name = await UrlConstructor.getCardName(this.id);
    };
    verifyData() {
        if (!this.userExist) return "Wrong user name";
        if (!this.rank && (!this.src || this.mp4)) return "Wrong card id";
    }

    async need({ filter, cache } = {}) {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        await this.setCardName();
        return await this.getNeededCards({ filter, cache });
    }

    async trade({ filter, cache, online, needCount } = {}) {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        await this.setCardName();
        return await this.getTradeUsersCards("trade", { filter, cache, online, needCount });
    }

    async users({ filter, cache, online, needCount } = {}) {
        await this.setData();
        const answer = this.verifyData();
        if (answer) return { error: answer };
        await this.setCardName();
        return await this.getTradeUsersCards("users", { filter, cache, online, needCount });
    }

    async getNeededCards({ filter = false, cache = false } = { filter: false, cache: false }) {
        const getCards = new GetCards({ user: new User({ userUrl: this.userUrl, userName: this.userName }), rank: this.rank });
        let [userInventoryCards, userNeededCards] = await Promise.all([
            getCards.getInventory({ unlock: filter ? true : null, cache }),
            getCards.getNeed({ cache }),
        ]);

        const userCard = getCardBySrc(userInventoryCards, this.src);

        const url = UrlConstructor.getCardNeedUrl(this.id);
        const usersList = await getUsersList(url, { limit: this.limit, pageLimit: this.pageLimit });

        const usersCards = await findUsersCards(usersList, async user => {
            const { userUrl, userName } = user;
            const getCard = new GetCards({ user: new User({ userUrl, userName }), rank: this.rank });
            const unlock = filter ? true : (usersList.length > 75 ? true : null);
            const cards = await getCard.getInventoryTrade({ unlock, cache });
            return cards;
        });

        this._processCards(usersCards);

        this._addOrangeBorder(usersCards, userInventoryCards);
        this._upPriority(usersCards, userNeededCards);

        this._filterCards(usersCards, 200, 0);

        usersCards.sort();

        this._setSearchLink(usersCards);

        if (userCard) {
            usersCards.forEach(card => {
                card.tradeLink = UrlConstructor.tradeLink(card.id, userCard.id);
                card.tradeId = userCard.id;
                card.tradeLock = userCard.lock;
                card.tradeCardId = userCard.cardId;
            });
        }

        if (!usersCards.length) {
            return { error: "No cards found" };
        }

        this._setCardInfo({ cards: usersCards, users: usersList });
        return usersCards;
    }

    async getTradeUsersCards(mode, { filter = false, cache = false, online = false, needCount = false } = { filter: false, cache: false, online: false, needCount: false }) {
        const getCards = new GetCards({ user: new User({ userUrl: this.userUrl, userName: this.userName }), rank: this.rank });
        const userCards = await getCards.getInventory({ unlock: filter ? true : null, cache });
        let url;
        switch (mode) {
            case "trade":
                url = UrlConstructor.getCardTradeUrl(this.id);
                break;
            case "users":
                url = UrlConstructor.getCardUrl(this.id, true);
                break;
        }

        const usersList = await getUsersList(url, {
            limit: this.limit,
            pageLimit: this.pageLimit,
            filterLock: filter,
            filterOnline: online,
        });

        const usersCards = await findUsersCards(usersList, async user => {
            const { userUrl, userName } = user;
            const getCards = new GetCards({ user: new User({ userUrl, userName }), rank: this.rank });
            const cards = await getCards.getNeed({ cache });
            return cards;
        });

        const cards = this._compareCards(userCards, usersCards);

        this._setSearchLink(cards, this.name);
        await this._setTradeInfo(cards);
        this._setTradeLink(cards);

        filter ? this._filterNotAvailable(cards) : this._filterCards(cards, 75, -1);

        this._processCards(cards, true);

        
        if (!cards.length) return { error: "No cards found" };
        
        
        if (needCount) {
            const [_, cardNeedCount] = await Promise.all([
                this._needCount(cards, { cache }),
                GetCards.getNeedCount({ id: this.id, cache })
            ]);
            this._setNeedCount({ cards, needCount: cardNeedCount });
        }

        this._setCardInfo({ cards, users: usersList} );
        
        cards.sort();

        return cards;
    }

    _upPriority(otherCards, userNeededCards) {
        otherCards.forEach(otherCard => {
            if (userNeededCards.find(userCard => userCard.cardId === otherCard.cardId)) {
                otherCard.sortPriority = 1;
                otherCard.setBorder(globalColors.purple);
            }
        })
    }

    _addOrangeBorder(otherCards, userCards) {
        otherCards.forEach(otherCard => {
            otherCard.removeBorderds();
            if (userCards.find(userCard => userCard.cardId === otherCard.cardId)) {
                otherCard.dubles = 1;
                otherCard.setBorder(globalColors.orange);
            }
        })
    }

    _processCards(cards, addIcon = false) {
        cards.forEach(card => {
            card.fixCard();
            addIcon && card.addLockIcon(card.tradeLock);
            card.fixLockIcon();
            card.addLink();
            card.setColorByRate();
            card.removeBorderds();
            card.removeButton();
        });
    }

    async _needCount(cards, { cache = false } = { cache: false }) {
        const setCards = new Set(cards.map(card => card.cardId));

        const promises = Array.from(setCards).map(async cardId => {
            const count = await GetCards.getNeedCount({ id: cardId, cache });
            return { cardId, count };
        });

        const results = await Promise.all(promises);

        const countsMap = new Map();
        results.forEach(({ cardId, count }) => {
            countsMap.set(cardId, count);
        });

        cards.forEach(card => {
            card.needCount = countsMap.get(card.cardId) || 0;
        });
    }

    _compareCards(userCards, otherCards) {
        otherCards.filter(otherCard => {
            const copyCards = new CardsArray();
            copyCards.push(...userCards);
            copyCards.filter(userCard => userCard.cardId === otherCard.cardId);

            let userCard;
            userCard = copyCards.find(userCard => userCard.lock === "unlock");
            userCard = userCard || copyCards.find(userCard => userCard.lock === "lock");
            userCard = userCard || copyCards.find(userCard => userCard.lock === "trade");
            userCard = userCard || copyCards.find(userCard => userCard.lock === "trophy");
            if (userCard) {
                otherCard.rate = otherCard.rate < 0 ? otherCard.rate : userCard.rate;
                otherCard.tradeId = userCard.id;
                otherCard.tradeLock = userCard.lock;
                return userCard
            }
        })
        return otherCards;
    }

    _filterCards(cards, length = 75, rate = 0) {
        if (cards.length > length) {
            cards.filter(card => card.rate > rate);
        }
    }

    _filterNotAvailable(cards) {
        cards.filter(card => card.rate > 0.5 && card.rate !== 1.5);
    }

    _setSearchLink(cards, name = null) {
        cards.forEach(card => {
            const urlConstructor = new UrlConstructor({ rank: this.rank, userUrl: card.url });
            card.searchLink = urlConstructor.search(name || card.name);
        });
    }

    async _setTradeInfo(cards) {
        const users = new Set(cards.map(card => card.searchLink));
        const results = {};
        await Promise.all(
            Array.from(users).map(async searchLink => {
                const getCards = new GetCards();
                const cards = await getCards.getAllCards(searchLink);
                cards.filter(card => card.cardId == this.id);
                let card;
                card = cards.find(card => card.lock === "unlock");
                card = card || cards.find(card => card.lock === "trade");
                card = card || cards.find(card => card.lock === "lock");
                card = card || cards.find(card => card.lock === "trophy");
                results[searchLink] = card;
            })
        );

        cards.forEach(card => {
            const anotherCard = results[card.searchLink];

            if (anotherCard) {
                card.id = anotherCard.id;
                card.lock = anotherCard.lock;
                if (card.lock !== "unlock") {
                    card.rate = -1;
                }
            }
        });
    }


    _setTradeLink(cards) {
        cards.forEach(card => {
            if (card.id && card.tradeId && card.lock === "unlock") {
                card.tradeLink = UrlConstructor.tradeLink(card.id, card.tradeId);
            }
        });
    }

    _setCardInfo({ cards, users }) {
        cards.info = {
            ...cards.info,
            rank: this.rank,
            name: this.name,
            src: this.src,
            id: this.id,
            mp4: this.mp4,
            webm: this.webm,
            usersLength: users.length,
        }
    }

    _setNeedCount({cards, needCount}) {
        cards.info = {
            ...cards.info,
            needCount: needCount,
        }
    }
}