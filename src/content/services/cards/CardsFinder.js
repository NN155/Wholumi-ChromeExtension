class CardsFinderCore {
    constructor({ id, username }) {
        this.card = new Card();
        this.card.cardId = id;
        this.card.user = new User({ username: username });
    }

    async getCardData({ verifyUser = false } = { verifyUser: false }) {
        if (verifyUser) {
            await this._checkUserExistence();
        }

        await this._setCard();

        return this.card;
    }

    async _setCard() {
        try {
            await this._setCardData();
            await this._setCardName();
        } catch (error) {
            throw new CardsFinderError(`Wrong Id or other errors`);
        }
    }

    async _setCardData() {
        const cardUrl = UrlConstructor.getCardUrl(this.card.cardId);
        const dom = await FetchService.parseFetch(cardUrl);

        const cardInfo = getCardInfo(dom);
        this.card.rank = cardInfo.rank;
        this.card.src = cardInfo.src;
        this.card.mp4 = cardInfo.mp4;
        this.card.webm = cardInfo.webm;

    }

    async _setCardName() {
        this.card.name = await UrlConstructor.getCardName(this.card.cardId);
    };

    async _checkUserExistence() {
        const username = await UrlConstructor.validateUser(this.card.user.username);
        if (!username) {
            throw new CardsFinderError(`User ${this.username} does not exist`);
        }

        this.card.user = new User({ username: username });
    }
}

class CardsFinderError extends Error {
    constructor(message) {
        super(message);
        this.name = "CardsFinderError";
    }
}

class CardsFinderSearching {

    constructor({ card, limit = 3000, testMode = false }) {
        this.card = card;
        this.limit = limit;
        this.testMode = testMode;
    }

    async need({ filter = false, cache = false }) {
        let { userCards, userNeededCards } = await this._userNeedData({ cache });
        const { usersCards } = await this._usersNeedData({ filter, cache });
        return { userCards, userNeededCards, usersCards };
    }

    async _userNeedData({ cache = false }) {
        const getCards = new GetCards({ user: this.card.user, rank: this.card.rank });
        let [userCards, userNeededCards] = await Promise.all([
            getCards.getInventory({ card: this.card, cache }),
            getCards.getNeed({ cache }),
        ]);

        userCards.withoutStars();
        return { userCards, userNeededCards };
    }

    async _usersNeedData({ filter = false, cache = false }) {
        const url = UrlConstructor.getCardNeedUrl(this.card.cardId);
        let usersList = await getUsersList(url, { limit: this.limit });
        usersList = usersList.filter(user => user.username !== this.card.user.username);

        const usersCards = await this._findUsersCards(usersList, async user => {
            const getCard = new GetCards({ user, rank: this.card.rank });
            const ranks = ["a", "b", "c", "d", "e"];
            const unlock = filter ? true : (ranks.includes(this.card.rank) ? true : null);
            const cards = await getCard.getInventoryTrade({ unlock, cache });
            return cards;
        });

        usersCards.withoutStars();

        return { usersCards };
    }

    async trade({ filter, cache, online } = {}) {
        return await this.tradeOrUsers({ mode: "trade", filter, cache, online });
    }

    async users({ filter, cache, online } = {}) {
        return await this.tradeOrUsers({ mode: "users", filter, cache, online });
    }

    async tradeOrUsers({ mode, filter = false, cache = false, online = false }) {
        const { userCards } = await this._userTradeUsersData({ filter, cache });
        const { usersCards } = await this._usersTradeUsersData({ mode, filter, cache, online });
        return { userCards, usersCards };
    }

    async _userTradeUsersData({ filter = false, cache = false }) {
        const getCards = new GetCards({ user: this.card.user, rank: this.card.rank });
        const userCards = await getCards.getInventory({ unlock: filter ? true : null, cache })
        userCards.withoutStars();
        return { userCards };
    }

    async _usersTradeUsersData({ mode, filter = false, cache = false, online = false }) {
        let url;

        const ranks = ["a", "b", "c", "d", "e"];
        filter = filter || ranks.includes(this.card.rank);
        this.testMode && console.log("CardsFinderSearching: Mode", mode, "filter", filter, "Online", online);

        switch (mode) {
            case "trade":
                url = UrlConstructor.getCardTradeUrl(this.card.cardId);
                break;
            case "users":
                url = UrlConstructor.getCardUrl(this.card.cardId, filter);
                break;
        }

        this.testMode && console.log("CardsFinderSearching: URL", url);

        let usersList = await getUsersList(url, {
            limit: this.limit,
            filterLock: filter,
            filterOnline: online,
        });


        usersList = usersList.unique();

        this.testMode && console.log("CardsFinderSearching: Users List", usersList);

        const usersCards = await this._findUsersCards(usersList, async user => {
            const getCards = new GetCards({ user, rank: this.card.rank });
            const cards = await getCards.getNeed({ cache });
            return cards;
        });

        return { usersCards };
    }

    async _findUsersCards(usersList, callBack) {
        const usersCards = new CardsArray();
        const userCardsPromises = usersList.map(callBack);
        const userCardsResults = await Promise.all(userCardsPromises);
        userCardsResults.forEach(data => {
            usersCards.push(...data);
        });
        return usersCards;
    }


    static async findCards({ card }) {
        const getCards = new GetCards();
        const urlConstructor = new UrlConstructor({ rank: card.rank, userUrl: card.user.userUrl });

        const searchLink = urlConstructor.search(card.name);
        const cards = await getCards.getAllCards(searchLink);
        cards.filter(c => c.compare(card))
        cards.forEach(c => {
            c.user = card.user;
            c.rank = card.rank;
        });
        return cards;
    }
}

class CardsFinderProcess {
    constructor({ card }) {
        this.card = card;
    }

    need({ userCards, userNeededCards, usersCards }) {
        CardsFinderProcessHelper.processCards(usersCards);

        CardsFinderProcessHelper.addOrangeBorder(usersCards, userCards);
        CardsFinderProcessHelper.upPriority(usersCards, userNeededCards);
        CardsFinderProcessHelper.setOnlineBoard(usersCards);

        CardsFinderProcessHelper.filterCards(usersCards, 200, 0);

        usersCards.sort();

        CardsFinderProcessHelper.ErrorIfEmpty(usersCards);

        if (userCards) {
            const cards = userCards.getBestCards({ cardId: this.card.cardId });
            usersCards.forEach(card => {
                card.tradeCards = cards
            });
        }

        return usersCards;
    }
}

class CardsFinderProcessHelper {
    static filterCards(cards, length = 75, rate = 0) {
        if (cards.length > length) {
            cards.filter(card => card.rate > rate);
        }
    }

    static filterNotAvailable(cards) {
        cards.filter(card => card.rate > 0.5 && card.rate !== 1.5);
    }

    static setOnlineBoard(cards) {
        cards.forEach(card => {
            if (card.user.online && !card.sortPriority && !card.dubles && card.rate >= 0) card.setBorder(globalColors.ligthGreen);
        });
    }

    static upPriority(otherCards, userNeededCards) {
        otherCards.forEach(otherCard => {
            if (userNeededCards.find(userCard => userCard.compare(otherCard))) {
                otherCard.sortPriority = 1;
                otherCard.setBorder(globalColors.purple);
            }
        })
    }

    static processCards(cards, addIcon = false) {
        cards.forEach(card => {
            card.fixCard();
            addIcon && card.addLockIcon(card.tradeCard.lock);
            card.fixLockIcon();
            card.addLink();
            card.setColorByRate();
            card.removeBorderds();
            card.removeButton();
        });
    }

    static addOrangeBorder(otherCards, userCards) {
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

    static ErrorIfEmpty(cards) {
        if (!cards.length) {
            throw new CardsFinderError("No cards found");
        }
    }

    static async setNeedCount({ cards, cache = false }) {
        const map = new Map();
        cards.forEach(card => {
            if (!map.has(card.cardId)) {
                map.set(card.cardId, 0);
            }
            if (!map.has(card.tradeCard.cardId)) {
                map.set(card.tradeCard.cardId, 0);
            }
        })

        const promises = [];
        for (const cardId of map.keys()) {
            promises.push(
                GetCards.getNeedCount({ id: cardId, cache }).then(needCount => {
                    map.set(cardId, needCount);
                })
            );
        }
        await Promise.all(promises);

        cards.forEach(card => {
            card.needCount = map.get(card.cardId);
            card.tradeCard.needCount = map.get(card.tradeCard.cardId);
        })
    }
}

class CardsFinderTradeOrUsersProcessHelper extends CardsFinderProcessHelper {
    static compareCards({ userCards, usersCards }) {
        let userCardsMap = new Map();

        userCards.sort();

        // Group userCards by cardId
        userCards.forEach(userCard => {
            if (!userCardsMap.has(userCard.cardId)) {
                userCardsMap.set(userCard.cardId, new CardsArray(userCard));
            } else {
                const existingCards = userCardsMap.get(userCard.cardId);
                existingCards.push(userCard);
            }
        });
        const tempUserCardsMap = new Map();
        // Filter out usersCards that have matching cardId in userCards
        usersCards.filter(otherCard => {
            if (userCardsMap.has(otherCard.cardId)) {
                const cards = userCardsMap.get(otherCard.cardId);
                tempUserCardsMap.set(otherCard.cardId, cards);
                return true;
            }
            return false;
        });

        userCardsMap = tempUserCardsMap;

        // Map: username -> { user, wantedCards: [ [userCards...], ... ] }
        const usersCardsMap = new Map();

        usersCards.forEach(otherCard => {
            /* 
             * All these arrays are references to the same arrays from userCardsMap.
             * If you modify any of these arrays or their card objects, 
             * the changes will be reflected everywhere they are used. 
             */
            if (!usersCardsMap.has(otherCard.user.username)) {
                usersCardsMap.set(otherCard.user.username, {
                    user: otherCard.user,
                    wantedCards: [userCardsMap.get(otherCard.cardId)]
                });
            } else {
                const obj = usersCardsMap.get(otherCard.user.username);
                obj.wantedCards.push(userCardsMap.get(otherCard.cardId));
            }
        });
        return { userCardsMap, usersCardsMap };
    }

    static processUserCardsMap({ userCardsMap }) {
        userCardsMap.forEach((cards, cardId) => {
            cards.forEach(card => {
                card.fixCard();
                card.setRateByLock();
                card.removeBorderds();
                card.removeButton();
            });
        });
    }

    static async setHaveCards({ usersCardsMap, card, filter = false }) {
        filter = filter || ["a", "b", "c", "d", "e"].includes(card.rank);
        const userPromises = Array.from(usersCardsMap.entries()).map(async ([username, userObj]) => {
            const cloneUser = new User({ username });
            const cloneCard = card.clone();
            cloneCard.user = cloneUser;

            const cards = await CardsFinderSearching.findCards({ card: cloneCard });

            filter && cards.filter(c => c.lock === "unlock");
            cards.withoutStars();
            cards.forEach(card => {
                card.rate = card.rate < 1 ? -1 : card.rate;
            })
            userObj.inventoryCards = cards;
        });

        await Promise.all(userPromises);
        return { usersCardsMap };
    }
}

class CardsFinderService {
    constructor({ testMode = false } = { testMode: false }) {
        this.testMode = testMode;
    }

    async need({ id, username, filter = false, cache = false, verifyUser = false, limit = 3000 }) {
        const cardsFinderCore = new CardsFinderCore({ id, username });
        const card = await cardsFinderCore.getCardData({ verifyUser });
        this.testMode && console.log("Card data set:", card);
        const cardsFinderSearching = new CardsFinderSearching({ card: card, limit: limit });
        const { userCards, userNeededCards, usersCards } = await cardsFinderSearching.need({ filter, cache });
        this.testMode && console.log("User Cards", userCards);
        this.testMode && console.log("User Needed Cards", userNeededCards);
        this.testMode && console.log("Users Cards", usersCards);
        return new CardsFinderProcess({ card }).need({ userCards, userNeededCards, usersCards });
    }

    async trade(props) {
        return await this._tradeOrUsers({ ...props, mode: "trade" });
    }

    async users(props) {
        return await this._tradeOrUsers({ ...props, mode: "users" });
    }

    async _tradeOrUsers({
        id,
        username,
        mode,
        filter = false,
        cache = false,
        online = false,
        verifyUser = false,
        limit = 200
    }) {
        const cardsFinderCore = new CardsFinderCore({ id, username });
        const card = await cardsFinderCore.getCardData({ verifyUser });
        this.testMode && console.log("Card data set:", card);
        const cardsFinderSearching = new CardsFinderSearching({ card: card, limit, testMode: this.testMode });
        const { userCards, usersCards } = await cardsFinderSearching.tradeOrUsers({ mode, filter, cache, online });
        this.testMode && console.log("User Cards", userCards);
        this.testMode && console.log("Users Cards", usersCards);
        const { userCardsMap, usersCardsMap } = CardsFinderTradeOrUsersProcessHelper.compareCards({ userCards, usersCards });
        CardsFinderTradeOrUsersProcessHelper.processUserCardsMap({ userCardsMap });
        this.testMode && console.log("User Cards Map", userCardsMap);
        this.testMode && console.log("Users Cards Map", usersCardsMap);
        await CardsFinderTradeOrUsersProcessHelper.setHaveCards({ usersCardsMap, card });
        this.testMode && console.log("Users Cards Map with Have Cards", usersCardsMap);
        return { userCardsMap, usersCardsMap };
    }
}

class CardsBuilder {
    constructor({ userCardsMap, usersCardsMap, testMode = false, cache = false }) {
        this.userCardsMap = userCardsMap;
        this.usersCardsMap = usersCardsMap;
        this.testMode = testMode;
        this.cache = cache;
    }

    buildCards() {
        const result = new CardsArray();
        for (const { user, inventoryCards, wantedCards } of this.usersCardsMap.values()) {
            if (inventoryCards.length && wantedCards && wantedCards.length) {
                inventoryCards.forEach(invCard => {
                    wantedCards.forEach(wantedArr => {
                        if (wantedArr && wantedArr.length) {
                            const wantedCard = wantedArr[0].clone();
                            const card = invCard.clone();
                            card.card = wantedCard.card;
                            card.tradeCard = wantedCard
                            card.user = user;
                            if (card.rate > 0) {
                                card.rate = wantedCard.rate;
                                card.lock = wantedCard.lock;
                                card.setTradeId(card.id);
                            }
                            card.clearAttributes();
                            card.addLink();
                            card.setColorByRate();
                            card.addLockIcon(card.lock);
                            card.fixLockIcon();
                            result.push(card);
                        }
                    });
                });
            }
        }
        CardsFinderProcessHelper.setOnlineBoard(result);
        result.sort({ byTradeCard: true });
        this.testMode && console.log("Cards Render Result", result);
        CardsFinderProcessHelper.ErrorIfEmpty(result);
        return result;
    }

    successTrade(card) {
        this.testMode && console.log("Trade Card", card);

        this._setUserCard(card);
        this._deleteInventoryCard(card);
        this._deleteWantedCard(card);


        this.cache && this._deleteInventoryCardFromCache(card);
    }

    unSuccessTrade(card, status) {
        if (status.error === "Without html") {
            this._deleteUser(card);
            this.cache && this._deleteUserFromCache(card);
        } else {
            this._deleteInventoryCard(card);
            this._deleteWantedCard(card);
        }
    }

    _setUserCard(card) {
        const userCards = this.userCardsMap.get(card.tradeCard.cardId)
        this.testMode && console.log("User Cards before trade", userCards.deepClone());
        const userCard = userCards.find(userCard => userCard.id === card.tradeCard.id);
        userCard.lock = "trade";
        userCard.rate = 0.5;
        userCards.sort();
        this.testMode && console.log("User Cards after trade", userCards);
    }

    _deleteInventoryCard(card) {
        const { inventoryCards } = this.usersCardsMap.get(card.user.username)
        this.testMode && console.log("Inventory Cards before trade", inventoryCards.deepClone());
        inventoryCards.filter(invCard => invCard.id !== card.id);
        this.testMode && console.log("Inventory Cards after trade", inventoryCards);
    }

    _deleteWantedCard(card) {
        const wantedCardsArr = this.usersCardsMap.get(card.user.username).wantedCards;
        this.testMode && console.log("Wanted Cards Array before trade", [...wantedCardsArr]);
        for (let index = 0; index < wantedCardsArr.length; index++) {
            const wantedCards = wantedCardsArr[index];
            if (wantedCards && wantedCards.length) {
                const wantedCard = wantedCards[0];
                if (wantedCard.cardId === card.tradeCard.cardId) {
                    wantedCardsArr.splice(index, 1);
                    break;
                }
            }
        }
        this.testMode && console.log("Wanted Cards Array after trade", wantedCardsArr);
    }

    _deleteUser(card) {
        this.testMode && console.log("Delete User", card.user.username);
        this.usersCardsMap.delete(card.user.username);
        this.testMode && console.log("Users Cards Map after delete user", this.usersCardsMap);
    }

    _deleteInventoryCardFromCache(card) {
        GetCards.cacheService.delete({
            method: "getInventory",
            rank: card.rank,
            username: card.user.username,
            cardId: card.id,
        });

        GetCards.cacheService.delete({
            method: "getInventory",
            rank: card.rank,
            username: card.tradeCard.username,
            cardId: card.tradeCard.id,
        });
    }

    _deleteUserFromCache(card) {
        GetCards.cacheService.delete({
            method: "getInventory",
            rank: card.rank,
            username: card.user.username,
        });
    }
}

class CardsRender {
    constructor({ cardsBuilder, testMode = false, cards = null }) {
        this.cardsBuilder = cardsBuilder;
        this.testMode = testMode;
        this.cards = cards;
    }

    bindCards() {
        const cards = this.cards || this.cardsBuilder.buildCards();
        cards.forEach(card => {
            this._change(card, ((card, status) => {
                this._statusCheck(card, status);
                this._close();
                this.render();
            }).bind(this));
        });
        return cards;
    }

    _change(card, callback) {
        card.addEventListener('click', async () => {
            let text;
            let disabled = false;
            let isLocked = card.tradeCard.lock === "lock";

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
                    if (disabled) return;
                    if (isLocked) {
                        await card.tradeCard.unlockCard();
                    }
                    const status = await TradeHelperService.trade(card)
                    await callback(card, status);
                }
            });

            await button.asyncPlaceAfter(".anime-cards__link")
        })
    }

    _statusCheck(card, status) {
        if (status.success) {
            this.cardsBuilder.successTrade(card);
            DLEPush.info(`Trade successful with ${card.tradeCard.username}`);
        } else {
            this.cardsBuilder.unSuccessTrade(card, status);
            DLEPush.warning(`Trade failed with ${card.tradeCard.username}`);
        }

    }

    render() {
        const cards = this.bindCards();
        if (!cards.length) {
            ShowBar.text("No cards found");
            return;
        }
        ShowBar.replaceElementsInBar(cards.getCardsArray());
    }

    _close() {
        const cont = document.querySelector(".ui-dialog-titlebar")
        cont?.querySelector("button")?.click()
    }
}