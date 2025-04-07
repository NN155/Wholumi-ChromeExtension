class DecksProgressAnalyzer {
    constructor() {
        this.filterRanks = ['a', 'b', 'c', 'd', 'e'];
        this.searchRanks = ["ass", "s", "a", "b", "c", "d", "e"];
        this.MIN_DECK_LENGTH = 10;
    }

    async getSiteCards() {
        const baseUrl = "/cards/?rank=";

        const cards = new CardsArray();

        const cardsPromises = this.searchRanks.map(async rank => {
            const cardInstance = new GetCards();
            const array = await cardInstance.getAllCards(`${baseUrl}${rank}`);
            cards.push(...array);
        });

        await Promise.all(cardsPromises);

        cards.forEach(card => {
            card.setAnimeName();
            card.setRank();
            card.setDubles();
        });

        return cards
    }

    organizeIntoDecks(cards) {
        const map = new Map();
        cards.forEach(card => {
            if (!map.has(card.animeName)) {
                map.set(card.animeName, new CardsArray());
            }

            map.get(card.animeName).push(card);
        });
        return map;
    }

    async markDuplicates(cards, username) {
        if (username === UrlConstructor.getMyName()) return;

        let userCards = await this._getUserCards(username);
        userCards = userCards.unique();
        addOrangeBorder(cards, userCards);
    }

    async _getUserCards(username) {
        try {
            const cards = new CardsArray();
            const cardsPromises = this.searchRanks.map(async rank => {
                const getCards = new GetCards({ rank, user: new User({ username }) });
                const arr = await getCards.getInventory();
                cards.push(...arr);
            });
            await Promise.all(cardsPromises);

            cards.forEach(card => {
                card.setRank();
            })
            return cards
        } catch (err) {
            return new CardsArray();
        }
    }

    filterDecks(map) {
        map.forEach((cards, animeName) => {
            if (cards.length < this.MIN_DECK_LENGTH) {
                map.delete(animeName);
                return;
            }
            const isNotFiltered = cards.find(card => !card.dubles && !this.filterRanks.includes(card.rank));
            if (isNotFiltered) {
                map.delete(animeName);
            }
        });
    }

    async decksAvailability(decks) {
        const promises = Array.from(decks.entries()).map(([animeName, cards]) => {
            const promises = cards
                .Filter(card => !card.dubles && card.rank === 'a')
                .map(async card => {
                    if (card.dubles || card.rank !== 'a') return;
                    const [count, unlockCount] = await Promise.all([
                        GetCards.getUsersCount({ id: card.cardId, unlock: false }),
                        GetCards.getUsersCount({ id: card.cardId, unlock: true }),
                    ]);
                    card.count = count;
                    card.unlockCount = unlockCount;
                });
            return Promise.all(promises);
        });
        await Promise.all(promises);
    }

    extractDeckStats(map) {
        const data = [];

        map.forEach((cards, animeName) => {
            const animeData = this.calculateDeckStats(cards);
            data.push({ ...animeData, animeName });
        });
        return data;
    }

    calculateDeckStats(cards) {
        let isNotFiltered = false;
        let ACount = 0;
        let ADubles = 0;
        let dubledCount = 0;
        let availability = [];
        cards.forEach(card => {
            if (!this.filterRanks.includes(card.rank)) {
                isNotFiltered = true;
            } else if (card.rank === 'a') {
                ACount++;
                if (card.dubles) {
                    ADubles++;
                }
            }
            if (card.dubles) {
                dubledCount++;
            }

            if (card.count !== undefined) {
                availability.push({
                    id: card.cardId,
                    count: card.count,
                    unlockCount: card.unlockCount,
                    name: card.name,
                    rank: card.rank,
                    percent: Math.round((card.unlockCount / (card.count !== 0 ? card.count : 1)) * 1000) / 10,
                });
            }
        });

        availability = availability.sort((a, b) => {
            if (a.percent === b.percent) return 0;
            return a.percent < b.percent ? -1 : 1;
        });

        return {
            isNotFiltered,
            ACount,
            ADubles,
            length: cards.length,
            dubledCount,
            completed: cards.length === dubledCount,
            availability,
        };
    }

    formatData(data) {
        const newData = [];
        data.forEach(item => {
            const info = {
                "Anime Name": item.animeName,
                "Length": `${item.dubledCount}/${item.length}`,
                "A Cards": `${item.ADubles}/${item.ACount}`,
                "Completed": item.completed ? "Yes" : "",
                "Has S+ Cards": item.isNotFiltered ? "Yes" : "",
            };
            const abvailabilityString = item.availability.map(card => {
                return `(${card.percent}%) ${card.unlockCount}/${card.count} - [${card.rank.toUpperCase()}]${card.name}  `;
            })
            info["Availability"] = abvailabilityString.join("\n");
            newData.push(info)
        });
        return newData;
    }

    sort(data) {
        data.sort((a, b) => {
            // 1. completed: completed decks first (true has higher priority)
            if (a.completed && !b.completed) return -1;
            if (!a.completed && b.completed) return 1;

            // 2. isNotFiltered: NotFiltered decks first (true has higher priority)
            if (a.isNotFiltered && !b.isNotFiltered) return -1;
            if (!a.isNotFiltered && b.isNotFiltered) return 1;

            // 3. !(ACount - ADubles): smaller difference has higher priority
            const aDiffA = a.ACount - a.ADubles;
            const bDiffA = b.ACount - b.ADubles;
            if (aDiffA < bDiffA) return -1;
            if (aDiffA > bDiffA) return 1;


            // 4. ACount: bigger is better
            if (a.ACount > b.ACount) return -1;
            if (a.ACount < b.ACount) return 1;

            // 5. length: bigger is better
            if (a.length > b.length) return -1;
            if (a.length < b.length) return 1;

            // 6. !(length-hasDubles): smaller difference has higher priority
            const aDiffTotal = a.length - a.hasDubles;
            const bDiffTotal = b.length - b.hasDubles;
            if (aDiffTotal < bDiffTotal) return -1;
            if (aDiffTotal > bDiffTotal) return 1;

            // If all criteria are equal, sort by anime name
            return a.animeName.localeCompare(b.animeName);
        });
    }
}

async function init() {
    new Button({
        text: 'Download Decks without S',
        onClick: async () => {
            try {

                const url = window.location.href;
                const usernameMatch = url.match(/\/user\/([^\/]+)/);
                const username = usernameMatch ? usernameMatch[1] : null;

                const decksProgressAnalyzer = new DecksProgressAnalyzer();
                const cards = await decksProgressAnalyzer.getSiteCards();

                await decksProgressAnalyzer.markDuplicates(cards, username);

                const decks = decksProgressAnalyzer.organizeIntoDecks(cards);

                decksProgressAnalyzer.filterDecks(decks);

                await decksProgressAnalyzer.decksAvailability(decks);

                const data = decksProgressAnalyzer.extractDeckStats(decks);
                decksProgressAnalyzer.sort(data);
                const formattedData = decksProgressAnalyzer.formatData(data);

                const columnsConfig = [
                    { header: "Anime Name", field: "Anime Name", size: 50 },
                    { header: "Length", field: "Length", size: 10 },
                    { header: "A Cards", field: "A Cards", size: 10 },
                    { header: "Completed", field: "Completed", size: 10 },
                    { header: "Has S+ Cards", field: "Has S+ Cards", size: 10 },
                ];
                columnsConfig.push({ header: "Availability", field: "Availability", size: 100, wrapText: true });

                downloadExcel(formattedData, columnsConfig, `Decks for ${username}.xlsx`);
                DLEPush.info("success", "Decks")
            }
            catch (err) {
                console.error(err);
                DLEPush.error("Something went wrong", "Decks")
            }
        },
        place: ".card-filter-form__controls",
    })
}

class ButtonManager {

    async initialize() {
        this._createButtons();
        await this._displayButtons();
        this._eventListener();
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

    async _createButtons() {
        // Build Deck button
        this.deckAnalizeButton = new Button({
            text: 'Download Decks without S',
            onClick: async () => {
                try {
                    const { decksProgressDeep } = await ExtensionConfig.getConfig("functionConfig");

                    const url = window.location.href;
                    const usernameMatch = url.match(/\/user\/([^\/]+)/);
                    const username = usernameMatch ? usernameMatch[1] : null;

                    const decksProgressAnalyzer = new DecksProgressAnalyzer();
                    const cards = await decksProgressAnalyzer.getSiteCards();

                    await decksProgressAnalyzer.markDuplicates(cards, username);

                    const decks = decksProgressAnalyzer.organizeIntoDecks(cards);

                    decksProgressAnalyzer.filterDecks(decks);

                    // if (decksProgressDeep)
                    decksProgressDeep && await decksProgressAnalyzer.decksAvailability(decks);

                    const data = decksProgressAnalyzer.extractDeckStats(decks);
                    decksProgressAnalyzer.sort(data);
                    const formattedData = decksProgressAnalyzer.formatData(data);

                    const columnsConfig = [
                        { header: "Anime Name", field: "Anime Name", size: 50 },
                        { header: "Length", field: "Length", size: 10 },
                        { header: "A Cards", field: "A Cards", size: 10 },
                        { header: "Completed", field: "Completed", size: 10 },
                        { header: "Has S+ Cards", field: "Has S+ Cards", size: 10 },
                    ];

                    // if (decksProgressDeep)
                    decksProgressDeep && columnsConfig.push({ header: "Availability", field: "Availability", size: 100, wrapText: true });

                    downloadExcel(formattedData, columnsConfig, `Decks for ${username}.xlsx`);
                    DLEPush.info("success", "Decks")
                }
                catch (err) {
                    console.error(err);
                    DLEPush.error("Something went wrong", "Decks")
                }
            },
            place: ".card-filter-form__controls",
            display: false,
        })
    }

    async _displayButtons() {
        const { decksProgress } = await ExtensionConfig.getConfig("functionConfig");
        const array = [{ switcher: this.deckAnalizeButton, config: decksProgress }];
        array.forEach(item => {
            item.switcher.display(decksProgress)
        });
    }
}


async function init() {
    // Initialize UI
    const buttonManager = new ButtonManager();
    await buttonManager.initialize();
}

init()