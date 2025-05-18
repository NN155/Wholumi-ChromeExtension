class Pack {
    constructor(cards) {
        this.cards = null;
        this.init = false
    }
    lootbox_choose() {
        if (this.init) return;
        this.init = true;
        $('body').on('click', '.lootbox__card-disabled', (event) => {
            if (lastPackTime > Date.now() - packConfig.info.cooldown) {
                DLEPush.warning('Слишком часто, подождите пару секунд и повторите действие');
                return;
            }
            var row = $(event.currentTarget).closest('.lootbox__row');
            var button = $(event.currentTarget);
            var id = $(event.currentTarget).attr('data-id');
            var rank = $(event.currentTarget).attr('data-rank');
            const data = this._lootbox_choose_fetch(rank, id);
            if (data.error) {
                DLEPush.warning(data.error);
                loadPacks();
                return false;
            }
            else if (data.hacker) {
                DLEPush.warning(data.hacker);
                row.removeClass('loot-lock');
                return false;
            }
            else {
                $('.lootbox__row').hide();
                $('.lootbox__card-disabled img').attr('src', '/templates/New/cards_system/empty-card.png');
                const checkbox = $('#disable_pack_card').prop('checked');
                if (!checkbox) {
                    openCardGiftModal({ ...data.card });
                }
                row.removeClass('loot-lock');
            }

            lastPackTime = Date.now();

            PacksPromise();
        });
    }

    _lootbox_choose_fetch(rank, id) {
        packConfig.packInventory.add(id);
        const cards = packConfig.siteInventory[rank];
        let card = cards.find(card => card.id === id);
        return { card: { image: card.image, name: card.name, rank: card.rank, card_mp4: card.video_mp4, card_webm: card.video_webm } };
    }
}

class Packs {
    constructor() {
        this.count = 1;
        this.pack = new Pack();
        this.pack.lootbox_choose();
        this.price = {
            1: 100,
            2: 200,
            6: 500,
        }
        this.garant = null;
    }

    isGarant(rank = "s") {
        if (this.garantS <= 0) {
            const card = this._genericRandomCard(rank);
            card.rank = rank;

            openCardGiftModal({
                image: card.image,
                name: card.name,
                rank: card.rank,
                card_mp4: card.video_mp4,
                card_webm: card.video_webm
            });

            packConfig.packInventory.add(card.id);
        }
    }

    async createPacks() {
        for (let i = 0; i < this.count; i++) {
            this.counter -= 1;
            this.genericData(this.counter === 0);
            this.pack.cards = this.data.cards;
            processLootboxData(this.data);

            await new Promise(resolve => PacksPromise = resolve);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async button_click() {
        this.balance = Number($('.lootbox__balance').text());
        this.counter = Number($('.lootbox__counter').text());
        this.garantS = Number($('.lootbox__counter__s').text());
        await new Promise(resolve => setTimeout(resolve, 100));
        if (this.balance >= this.price[this.count]) {
            $('.lootbox__balance').text(this.balance - this.price[this.count]);
            $('.lootbox__counter').text((this.counter - this.count + 39) % 39 || 39);
            $('.lootbox__counter__s').text((this.garantS - this.count + 1800) % 1800 || 1800);
            this.garantS -= this.count;
            this.isGarant();
            await this.createPacks();
        }
        else {
            DLEPush.warning('Недостаточно камней духа');
        }
        $('.lootbox__open-btn-disabled').prop('disabled', false);
        $('.lootbox__open-btn-disabled').show();

    }
    genericData(garant = false) {
        this.data = {
            "cards": [...this.genericCards(garant)],
        }
    }
    genericCards(garant = false) {
        const cards = []
        for (let i = 0; i < 3; i++) {
            cards.push(this.genericCard(garant));
        }
        return cards;
    }

    genericCard(garant) {
        const rank = garant ? "a" : this._genericRandomRank();
        const card = this._genericRandomCard(rank);
        card.rank = rank;
        card.owned = packConfig.packInventory.has(card.id) ? 1 : 0;
        return card;
    }
    _genericRandomCard(rank) {
        const cards = packConfig.siteInventory[rank];

        const randomIndex = Math.floor(Math.random() * cards.length);

        return cards[randomIndex];
    }

    _genericRandomRank() {
        const chances = packConfig.chances;
        const totalChance = chances.reduce((sum, item) => sum + item.chance, 0);

        const randomValue = Math.random() * totalChance;

        let cumulative = 0;
        for (const item of chances) {
            cumulative += item.chance;
            if (randomValue <= cumulative) {
                return item.rank;
            }
        }
    }
}

function modifyBuyButton() {
    $('.lootbox__open-btn').removeClass('lootbox__open-btn').addClass('lootbox__open-btn-disabled');
    $('.lootbox__open-btn-disabled').on('click', function () {
        var button = $(this);
        button.prop('disabled', true);
        $('.lootbox__open-btn-disabled').hide();
        var count = $('.lootbox__middle-item--active').attr('data-count');
        packs.count = count;
        packs.button_click();
    });
}

function replaceElement(elementSelector) {
    var $buttonCopy = $(elementSelector).clone(false);
    $(elementSelector).replaceWith($buttonCopy);
    return $buttonCopy;
}

function replaceAll() {
    replaceElement('.lootbox__open-btn');
    $('.lootbox__card').removeClass('lootbox__card').addClass('lootbox__card-disabled');
}

function firstLoad() {
    replaceAll()
    packs = new Packs();
    modifyBuyButton();
}

async function loadData() {
    let data = await ExtensionConfig.loadConfig("dataConfig", ["packInventory", "siteInventory"]);
    data = { ...data, ...await ExtensionConfig.loadConfig("miscConfig", ["packs"]) };
    return data;
}

function loadNewConfig(data) {
    if (data.packInventory) packConfig.packInventory = new Set(data.packInventory);
    if (data.siteInventory) packConfig.siteInventory = data.siteInventory;
    packConfig.info.balance = data.packs.balance;
    packConfig.info.counter = data.packs.counter;
    packConfig.info.garantS = data.packs.garantS;
    packConfig.info.cooldown = data.packs.cooldown;
    packConfig.chances = [
        { rank: "ass", chance: data.packs.assChance },
        { rank: "s", chance: data.packs.sChance },
        { rank: "a", chance: data.packs.aChance },
        { rank: "b", chance: data.packs.bChance },
        { rank: "c", chance: data.packs.cChance },
        { rank: "d", chance: data.packs.dChance },
        { rank: "e", chance: data.packs.eChance },
    ];
}

function submitChanges() {
    $('.lootbox__balance').text(packConfig.info.balance);
    $('.lootbox__counter').text(packConfig.info.counter);
    $('.lootbox__counter__s').text(packConfig.info.garantS);
}

let injected = false;
let packs;
let PacksPromise = null;
let lastPackTime = null;


let packConfig = {
    packInventory: new Set(),
    siteInventory: {},
    info: {
        balance: 10000,
        counter: 20,
        garantS: 500,
        cooldown: 2000,
    },
    chances: [
        { rank: "ass", chance: 1 },
        { rank: "s", chance: 1 },
        { rank: "a", chance: 1 },
        { rank: "b", chance: 1 },
        { rank: "c", chance: 1 },
        { rank: "d", chance: 1 },
        { rank: "e", chance: 1 },
    ]
}

function init() {
    window.addEventListener('packs', async (event) => {
        switch (event.detail.key) {
            case 'inject':
                if (!injected) {
                    injected = true;
                    firstLoad();
                }
                const data = await loadData();
                loadNewConfig(data);
                submitChanges();
                const newEvent = new CustomEvent(event.detail.event, {
                    detail: {
                        id: event.detail.id,
                    },
                });
                window.dispatchEvent(newEvent);
        }
    });
}

init()

