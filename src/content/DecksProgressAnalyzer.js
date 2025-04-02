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
        });
        return {
            isNotFiltered,
            ACount,
            ADubles,
            length: cards.length,
            dubledCount,
            completed: cards.length === dubledCount,
        };
    }

    formatData(data) {
        const newData = [];
        data.forEach(item => {
            newData.push({
                "Anime Name": item.animeName,
                "Length": `${item.dubledCount}/${item.length}`,
                "A Cards": `${item.ADubles}/${item.ACount}`,
                "Completed": item.completed ? "Yes" : "",
                "Has S+ Cards": item.isNotFiltered ? "Yes" : "",
            })
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

init()