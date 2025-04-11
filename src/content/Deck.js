class DeckService {
    constructor(config = {}) {
        this.config = {
            ...config
        };
    }

    async getCardsList() {
        const container = document.querySelector("#cards-carousel");
        const nodesContainer = container.querySelector(".anime-cards");

        if (!nodesContainer) {
            await this.setDesk();
        }

        return this._extractCardsFromDOM(container);
    }

    async setDesk() {
        const container = document.querySelector("#cards-carousel");
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

        return new CardsArray(...Array.from(nodes).map(node => {
            const card = new Card(node);
            card.setSrc();
            card.fixImage();
            card.setCardId();
            card.setDubles();
            card.setRank();
            return card;
        }));
    }
}

// TradeService.js - Handles card trading
class TradeService {
    constructor(config = {}) {
        this.config = {
            cardsRanks: ['a', 'b', 'c', 'd', 'e'],
            ...config
        };
        this.cardSearchService = new CardSearchService(config);
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
        console.log(`Trading card: rank: ${deckCard.rank}, cardId: ${card.cardId}${card.needCount ? `, popularity: ${card.needCount}` : ""}`);

        const response = await tradeHelper(card.id, card.tradeId);

        if (response.success) {
            // Update cache
            GetCards.cacheService.delete({
                id: card.tradeId,
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
    constructor() {
        this.lockedCount = 0;
        this.deckService = new DeckService();
        this.ranks = ["a", "b", "c", "d", "e"];
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
        console.log(`Successfully locked ${lockedCount} cards of rank ${rank}`);
    }

    async _lockCard(cards, deckCard) {
        const card = cards.find(card => card.cardId == deckCard.cardId);

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
    constructor(config = {}) {
        this.config = {
            popularityMargin: 15,
            specialRanks: ['a', 'b'],
            ...config
        };
    }

    async searchCard(card) {
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

            console.log(`Cards Array (${online ? 'Online ' : ''}${method})`, cardForTrade);

            if (cardForTrade) return cardForTrade;
        }

        return null;
    }

    async _searchCardForTrade({ id, method, online, needCountDiff }) {
        const cards = await this._getCards({ id, method, online, needCountDiff });

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
        const cardsFinder = new CardsFinder({
            id,
            username: UrlConstructor.getMyName()
        });

        let cards = await cardsFinder[method]({
            filter: true,
            cache: true,
            online,
            needCount: !!needCountDiff,
            limit: 200,
            page: 7
        });

        if (cards.error) cards = new CardsArray();
        return cards;
    }

    _resolve({ cards, needCountDiff }) {
        if (cards.length <= 0) return null;

        if (needCountDiff) {
            // Return card with minimum popularity within acceptable range
            return cards
                .filter(card => card.needCount - cards.info.needCount < this.config.popularityMargin)
                .min("needCount");
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
            if (cards.find(card => trade?.userCards[0]?.id === card.cardId)) arr.push(trade.tradeId);
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
            const myCard = myCards.find(c => c.cardId === card.cardId);
            if (type ? !myCard : myCard) {
                ids.push(card.cardId);
            }
        }
        await ProtectedFetchService.proposeCards(ids, 0);
        this.count = ids.length;
    }

    async _clearCache() {
        this.ranks.forEach(rank => {
            GetCards.cacheService.delete({ method: "getNeed", rank, username: UrlConstructor.getMyName()})
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
        if (!document.querySelector("#cards-carousel")) return;

        this._createButtons();
        await this._displayButtons();
        this._styleButtons();
        this._eventListener();
    }

    _createButtons() {
        // Build Deck button
        const buildDeckButton = new Button({
            text: "Build Deck",
            onClick: () => this._handleButtonClick(async () => {
                const deckService = new DeckService();
                const tradeService = new TradeService();

                const cards = await deckService.getCardsList();
                await tradeService.buildDeck(cards);
            }),
            place: ".sect__header.sect__title",
            display: false,
        });

        // Lock Deck button
        const lockDeckButton = new Button({
            text: "Lock Deck",
            onClick: () => this._handleButtonClick(async () => {
                const lockService = new CardLockService();
                await lockService.lockCards();
            }),
            place: ".sect__header.sect__title",
            display: false,
        });

        // Cancel Trades button
        const cancelTradesButton = new Button({
            text: "Cancel Trades",
            onClick: () => this._handleButtonClick(async () => {
                const deckService = new DeckService();
                const tradeSearchService = new TradeSearchService();
                const tradeRejectionService = new TradeRejectionService();

                const cards = await deckService.getCardsList();

                const ids = await tradeSearchService.getActiveTradesIds(cards);

                // Update cards info
                await tradeRejectionService.rejectTrades(ids);

                DLEPush.info(`${ids.length} trades have been canceled`);
            }),
            place: ".sect__header.sect__title",
            display: false,
        });

        // Update deck info button
        const updateDeckButton = new Button({
            text: "Update deck info",
            onClick: () => this._handleButtonClick(async () => {
                const deckService = new DeckService();
                const tradeSearchService = new TradeSearchService();
                const deckUpdateService = new DeckUpdateService();

                // Refresh deck
                await deckService.setDesk();

                const cards = await deckService.getCardsList();

                const ids = await tradeSearchService.getActiveCardsIds(cards);

                // Update cards info
                deckUpdateService.updateDesk(cards, ids);
            }),
            place: ".sect__header.sect__title",
            display: false
        });

        const addToWishlistButton = new Button({
            text: "Add to wishlist",
            onClick: () => this._handleButtonClick(async () => {
                const deckService = new DeckService();
                const cards = await deckService.getCardsList();

                const wishListService = new WishListService();
                await wishListService.add(cards);

                DLEPush.info(`${wishListService.count} cards have been added to wishlist`);
            }),
            place: ".sect__header.sect__title",
            display: false
        });

        const removeFromWishlistButton = new Button({
            text: "Remove from wishlist",
            onClick: () => this._handleButtonClick(async () => {
                const deckService = new DeckService();
                const cards = await deckService.getCardsList();

                const wishListService = new WishListService();
                await wishListService.remove(cards);
                
                DLEPush.info(`${wishListService.count} cards have been removed from wishlist`);
            }),
            place: ".sect__header.sect__title",
            display: false
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

    async _displayButtons() {
        const { deckBuilder } = await ExtensionConfig.getConfig("functionConfig");
        this.buttons.forEach(item => {
            item.display(deckBuilder)
        });
    }

    _eventListener() {
        window.addEventListener('config-updated', async (event) => {
            switch (event.detail.key) {
                case "functionConfig":
                    await this._displayButtons();
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