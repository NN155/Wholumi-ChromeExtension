class DeckService {
    constructor({ testMode = false } = { testMode: false }) {
        this.testMode = testMode;
    }

    async getCardsList() {
        const container = document.querySelector(".cards-carousel");
        const nodesContainer = container.querySelector(".anime-cards");

        if (!nodesContainer) {
            await this.setDesk();
        }

        return this._extractCardsFromDOM(container);
    }

    async setDesk() {
        const container = document.querySelector(".sect__content.owl-carousel");
        const html = await this._getHtmlDesk();

        if (html) {
            container.innerHTML = html;
        }
    }

    async _getHtmlDesk() {
        const animeId = UrlConstructor.getAnimeId(window.location.href);
        let response = await FetchService.getDeck(animeId);

        while (response.error) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            response = await FetchService.getDeck(animeId);
        }

        return response.html;
    }

    _extractCardsFromDOM(container) {
        const nodes = container.querySelectorAll(".anime-cards__item-wrapper");

        const cards = new CardsArray(...Array.from(nodes).map(node => {
            const card = new Card(node);
            card.setSrc();
            card.fixImage();
            card.setCardId();
            card.setDubles();
            card.setRank();
            return card;
        }));
        this.testMode && console.log("Deck cards:", cards);
        return cards;
    }
}

// TradeService.js - Handles card trading
class TradeService {
    constructor({ testMode = false } = { testMode: false }) {
        this.config = {
            cardsRanks: ['a', 'b', 'c', 'd', 'e'],
        };
        this.testMode = testMode;
        this.cardSearchService = new CardSearchService({ testMode });
    }

    async buildDeck(deckCards) {
        // Filter cards that need trading
        const validCards = deckCards.filter(
            card => !card.dubles &&
                this.config.cardsRanks.includes(card.rank) &&
                !card.hasClass("success")
        );

        await this.tradingCards(validCards);
    }

    async tradingCards(deckCards) {
        for (let i = 0; i < deckCards.length; i++) {
            const deckCard = deckCards[i];
            deckCard.pulsing(true);
            try {
                const cardForTrade = await this.cardSearchService.searchCard(deckCard);

                if (!cardForTrade) {
                    this._setCardResult(deckCard, false);
                    continue;
                }

                const success = await this._executeTradeTransaction(cardForTrade, deckCard);
                this._setCardResult(deckCard, success);
            } catch (error) {
                console.error("Trade error:", error);
                this._setCardResult(deckCard, false);
            }
        }
    }

    _setCardResult(card, success) {
        card.pulsing(false);

        if (success) {
            card.addClass("success");
            card.setColor(globalColors.darkGreen);
        } else {
            card.removeClass("success");
            card.setColor(globalColors.red);
        }
    }

    async _executeTradeTransaction(card, deckCard) {
        this.testMode && console.log(`Trading card: rank: ${deckCard.rank}, cardId: ${card.cardId}${card.needCount ? `, popularity: ${card.needCount}` : ""}`);

        const response = await TradeHelperService.trade(card);

        if (response.success) {
            // Update cache
            GetCards.cacheService.delete({
                id: card.tradeCard.id,
                method: "getInventory",
                rank: deckCard.rank,
                username: UrlConstructor.getMyName()
            });

            GetCards.cacheService.delete({
                cardId: deckCard.cardId,
                method: "getNeed",
                rank: deckCard.rank,
                username: card.username
            });
        }

        return response.success;
    }
}

class CardLockService {
    constructor({ testMode = false } = { testMode: false }) {
        this.lockedCount = 0;
        this.deckService = new DeckService({ testMode });
        this.ranks = ["a", "b", "c", "d", "e"];
        this.testMode = testMode;
    }

    async lockCards() {
        this.lockedCount = 0;
        const deckCards = await this.deckService.getCardsList();

        // Filter cards to lock
        deckCards.filter(card => card.dubles && this.ranks.includes(card.rank));

        // Process each rank in parallel
        const promises = this.ranks.map(async rank => {
            const cards = deckCards.Filter(card => card.rank === rank);
            await this._lockCardsRank(cards);
        });

        await Promise.all(promises);
        DLEPush.info(`${this.lockedCount} cards have been locked`);
    }

    async _lockCardsRank(deckCards) {
        if (deckCards.length <= 0) return;

        const rank = deckCards[0].rank;
        const getCards = new GetCards({
            user: new User({
                username: UrlConstructor.getMyName(),
                userUrl: UrlConstructor.getMyUrl()
            }),
            rank: rank
        });

        let cards = await getCards.getInventory();
        cards = cards.reverse();

        const results = await Promise.all(
            deckCards.map(deckCard => this._lockCard(cards, deckCard))
        );

        // Count successful locks
        const lockedCount = results.filter(Boolean).length;
        this.testMode && console.log(`Successfully locked ${lockedCount} cards of rank ${rank}`);
    }

    async _lockCard(cards, deckCard) {
        const card = cards.find(card => card.compare(deckCard));

        if (card && card.lock !== "lock") {
            try {
                await card.lockCard();
                this.lockedCount++;
                return true;
            } catch (error) {
                console.error(`Failed to lock card ${deckCard.cardId}:`, error);
                return false;
            }
        }

        return false;
    }
}

// CardSearchService.js - Handles card searching
class CardSearchService {
    constructor({ testMode = false } = { testMode: false }) {
        this.config = {
            popularityMargin: 15,
            specialRanks: ['a', 'b'],
        };
        this.testMode = testMode;
    }

    async searchCard(card) {
        this.testMode && console.log(`Searching for card: ${card.cardId}, rank: ${card.rank}`);
        // Determine if this card needs special popularity margin
        const needCountDiff = this.config.specialRanks.includes(card.rank)
            ? this.config.popularityMargin
            : 0;

        // Define search strategies in order of preference
        const searchStrategies = [
            { method: "trade", online: true },
            { method: "users", online: true },
            { method: "trade", online: false },
            { method: "users", online: false }
        ];

        // Try each strategy in order
        for (const strategy of searchStrategies) {
            const { method, online } = strategy;
            const cardForTrade = await this._searchCardForTrade({
                id: card.cardId,
                method,
                online,
                needCountDiff
            });

            this.testMode && console.log(`Cards Array (${online ? 'Online ' : ''}${method})`, cardForTrade);

            if (cardForTrade) return cardForTrade;
        }

        return null;
    }

    async _searchCardForTrade({ id, method, online, needCountDiff }) {
        const cards = await this._getCards({ id, method, online, needCountDiff });
        
        this.testMode && console.log(`Cards found (${method}, online: ${online}):`, cards);

        while (true) {
            const card = this._resolve({ cards, needCountDiff });
            if (!card) return card;
            if (await this._checkUserHistory({ cardId: id, username: card.username })) {
                cards.filter(c => card.username !== c.username);
                continue;
            }
            return card;
        }
    }

    async _checkUserHistory({ cardId, username }) {
        const data = await TradeHistoryService.cancelSentTrades(username, { cache: true });
        let userCard = data.find(trade => trade?.cardsGained[0]?.cardId === cardId);
        return userCard;
    }

    async _getCards({ id, method, online, needCountDiff }) {
        const cardsFinder = new CardsFinderService({
            testMode: this.testMode
        });
        let cards;
        try {
            let data = await cardsFinder[method]({
                filter: true,
                cache: true,
                online,
                limit: 200,
                id,
                username: UrlConstructor.getMyName(),
            });
            const cardsBuilder = new CardsBuilder({ ...data, cache: true, testMode: this.testMode });
            cards = cardsBuilder.buildCards();
            !!needCountDiff && await CardsFinderProcessHelper.setNeedCount({ cards, cache: true })
        } catch (error) {
            cards = new CardsArray();
        }
        return cards;
    }

    _resolve({ cards, needCountDiff }) {
        if (cards.length <= 0) return null;

        if (needCountDiff) {
            // Return card with minimum popularity within acceptable range
            return cards
                .filter(card => card.tradeCard.needCount - card.needCount < this.config.popularityMargin)
                .minTradeCard("needCount");
        } else {
            // Get random card if popularity doesn't matter
            return cards.random();
        }
    }
}

class TradeSearchService {
    constructor() {
        this.ranks = ["a", "b", "c", "d", "e"];
    }

    async getActiveCardsIds(cards) {
        cards.filter(card => this.ranks.includes(card.rank));
        const tradesIds = await this._getSentTrades();
        const ids = this._getCardsIds(cards, tradesIds);
        return ids;
    }


    async getActiveTradesIds(cards) {
        cards.filter(card => this.ranks.includes(card.rank));
        const trades = await this._getSentTrades();
        const ids = this._getTradesIds(cards, trades);
        return ids;
    }

    async _getSentTrades() {
        return await TradeMonitorService.getSent();
    }

    _getCardsIds(cards, trades) {
        const arr = [];
        cards.forEach(card => {
            if (trades.find(trade => trade?.userCards[0]?.id === card.cardId)) arr.push(card.cardId);
        });
        return arr;
    }

    _getTradesIds(cards, trades) {
        const arr = [];
        trades.forEach(trade => {
            if (cards.find(card => trade?.userCards[0]?.id === card.cardId)) arr.push(trade.tradeCard.id);
        });
        return arr;
    }
}

class DeckUpdateService {
    constructor() {
        this.ranks = ["a", "b", "c", "d", "e"];
    }

    updateDesk(cards, ids) {
        cards.filter(card => this.ranks.includes(card.rank));

        this._proccess(cards, ids);

        const count = cards.filter(card => ids.includes(card.cardId)).length;
        DLEPush.info("Update success! " + count + " cards have been updated");
    }

    _proccess(cards, ids) {
        cards.forEach(card => {
            const tempBool = ids.find(id => id === card.cardId);
            if (tempBool) {
                card.addClass("success");
                card.setColor(globalColors.darkGreen);
            } else {
                card.removeClass("success");
                card.setColor("");
            }
        });
    }
}

class TradeRejectionService {
    async rejectTrades(ids) {
        await Promise.all(ids.map(id => FetchService.cancelTradeBySended(id)));
    }
}

class WishListService {
    constructor() {
        this.ranks = ["a", "b", "c", "d", "e"];
        this.count = 0;
    }
    async add(cards) {
        cards.filter(card => this.ranks.includes(card.rank) && !card.dubles);

        await this._addCache(cards);

        await this._proposeAll(cards, true);

        this._clearCache()
    }

    async remove(cards) {
        cards.filter(card => this.ranks.includes(card.rank));

        await this._addCache(cards);

        await this._proposeAll(cards, false);

        this._clearCache()
    }

    async _getMyWishlist(rank) {
        const myUrl = UrlConstructor.getMyUrl();
        const cards = new GetCards({ user: new User({ userUrl: myUrl }), rank });
        const myCards = await cards.getNeed({ cache: true });
        return myCards;
    }


    async _proposeAll(cards, type) {
        const ids = [];
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const rank = card.rank;
            const myCards = await this._getMyWishlist(rank);
            const myCard = myCards.find(c => c.compare(card));
            if (type ? !myCard : myCard) {
                ids.push(card.cardId);
            }
        }
        await ProtectedFetchService.proposeCards(ids, 0);
        this.count = ids.length;
    }

    async _clearCache() {
        this.ranks.forEach(rank => {
            GetCards.cacheService.delete({ method: "getNeed", rank, username: UrlConstructor.getMyName() })
        });
    }

    async _addCache(cards) {
        const ranks = new Set();
        cards.forEach(card => {
            ranks.add(card.rank);
        });
        await Promise.all([...ranks].map(async rank => {
            const myUrl = UrlConstructor.getMyUrl();
            const cards = new GetCards({ user: new User({ userUrl: myUrl }), rank });
            const myCards = await cards.getNeed({ cache: true });
        }));
    }
}

// ButtonManager.js - Manages deck-related buttons
class ButtonManager {
    constructor() {
        this.buttons = [];
    }

    async initialize() {
        if (!document.querySelector(".cards-carousel")) return;

        this._createBox();
        this._createButtons();
        await this._display();
        this._styleButtons();
        this._eventListener();
    }

    _createButtons() {
        // Build Deck button
        const buildDeckButton = new Button({
            text: "Build Deck",
            onClick: () => this._handleButtonClick(async () => {
                const { testMode } = await ExtensionConfig.getConfig("functionConfig");
                const deckService = new DeckService({ testMode });
                const tradeService = new TradeService({ testMode });

                const cards = await deckService.getCardsList();
                await tradeService.buildDeck(cards);
            }),
            place: ".extension__box2",
        });

        // Lock Deck button
        const lockDeckButton = new Button({
            text: "Lock Deck",
            onClick: () => this._handleButtonClick(async () => {
                const { testMode } = await ExtensionConfig.getConfig("functionConfig");
                const lockService = new CardLockService({ testMode });
                await lockService.lockCards();
            }),
            place: ".extension__box2",
        });

        // Cancel Trades button
        const cancelTradesButton = new Button({
            text: "Cancel Trades",
            onClick: () => this._handleButtonClick(async () => {
                const { testMode } = await ExtensionConfig.getConfig("functionConfig");
                const deckService = new DeckService({ testMode });
                const tradeSearchService = new TradeSearchService();
                const tradeRejectionService = new TradeRejectionService();

                const cards = await deckService.getCardsList();

                const ids = await tradeSearchService.getActiveTradesIds(cards);

                // Update cards info
                await tradeRejectionService.rejectTrades(ids);

                DLEPush.info(`${ids.length} trades have been canceled`);
            }),
            place: ".extension__box2",
        });

        // Update deck info button
        const updateDeckButton = new Button({
            text: "Update deck info",
            onClick: () => this._handleButtonClick(async () => {
                const { testMode } = await ExtensionConfig.getConfig("functionConfig");
                const deckService = new DeckService({ testMode });
                const tradeSearchService = new TradeSearchService();
                const deckUpdateService = new DeckUpdateService();

                // Refresh deck
                await deckService.setDesk();

                const cards = await deckService.getCardsList();

                const ids = await tradeSearchService.getActiveCardsIds(cards);

                // Update cards info
                deckUpdateService.updateDesk(cards, ids);
            }),
            place: ".extension__box2",
        });

        const addToWishlistButton = new Button({
            text: "Add to wishlist",
            onClick: () => this._handleButtonClick(async () => {
                const { testMode } = await ExtensionConfig.getConfig("functionConfig");
                const deckService = new DeckService({ testMode });
                const cards = await deckService.getCardsList();

                const wishListService = new WishListService();
                await wishListService.add(cards);

                DLEPush.info(`${wishListService.count} cards have been added to wishlist`);
            }),
            place: ".extension__box2",
        });

        const removeFromWishlistButton = new Button({
            text: "Remove from wishlist",
            onClick: () => this._handleButtonClick(async () => {
                const { testMode } = await ExtensionConfig.getConfig("functionConfig");
                const deckService = new DeckService({ testMode });
                const cards = await deckService.getCardsList();

                const wishListService = new WishListService();
                await wishListService.remove(cards);

                DLEPush.info(`${wishListService.count} cards have been removed from wishlist`);
            }),
            place: ".extension__box2",
        });

        this.buttons.push(buildDeckButton, lockDeckButton, cancelTradesButton, updateDeckButton, addToWishlistButton, removeFromWishlistButton);
    }

    async _handleButtonClick(callback) {
        // Lock all buttons
        this.buttons.forEach(button => button.disable());

        try {
            await callback();
        } catch (error) {
            DLEPush.error("Something went wrong");
            console.error("Error in button action:", error);
        } finally {
            // Re-enable all buttons
            this.buttons.forEach(button => button.enable());
        }
    }

    _createBox() {
        this.box = new Box({
            place: ".sect__header.sect__title",
            display: false,
            center: true,
            className: "extension__box1",
        })
        new Box({
            place: ".extension__box1",
            className: "extension__box2",
        })
    }

    async _display() {
        const { deckBuilder } = await ExtensionConfig.getConfig("functionConfig");
        this.box.display(deckBuilder);
    }

    _eventListener() {
        window.addEventListener('config-updated', async (event) => {
            switch (event.detail.key) {
                case "functionConfig":
                    await this._display();
                    break;
            }
        });
    }

    _styleButtons() {
        const options = {
            marginTop: "1em"
        }

        this.buttons.forEach(button => {
            button.style(options);
        });
    }
}

async function init() {
    // Initialize UI
    const buttonManager = new ButtonManager();
    await buttonManager.initialize();
}

// Start the application
init();