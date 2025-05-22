class Pack {
    constructor() {
        this.cards = null;
        this.init = false;
    }
    lootbox_choose() {
        if (this.init) return;
        this.init = true;
        $('body').on('click', '.lootbox__card-disabled', (event) => {
            if (lastPackTime > Date.now() - PacksConfig.info.cooldown) {
                DLEPush.warning('Слишком часто, подождите пару секунд и повторите действие');
                return;
            }
            var row = $(event.currentTarget).closest('.lootbox__row');
            var id = $(event.currentTarget).attr('data-id');
            var rank = $(event.currentTarget).attr('data-rank');
            const data = this._lootbox_choose_fetch(rank, id);

            $('.lootbox__row').hide();
            $('.lootbox__card-disabled img').attr('src', '/templates/New/cards_system/empty-card.png');
            const checkbox = $('#disable_pack_card').prop('checked');
            if (!checkbox) {
                openCardGiftModal({ ...data.card });
            }
            row.removeClass('loot-lock');

            lastPackTime = Date.now();

            PacksPromise();
        });
    }

    _lootbox_choose_fetch(rank, id) {
        PacksConfig.packInventory.add(id);
        const card = cacheCards.getCacheFromPack(id);
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
        this.pageModifier = new PageModifier();
    }

    isGarant(rank = "s") {
        if (this.garantS <= 0) {
            const card = this.genericCard({ rank });

            openCardGiftModal({
                image: card.image,
                name: card.name,
                rank: card.rank,
                card_mp4: card.video_mp4,
                card_webm: card.video_webm
            });

            PacksConfig.packInventory.add(card.id);
        }
    }

    async createPacks() {

        this.isGarant();

        for (let i = 0; i < this.count; i++) {
            this.counter -= 1;
            this.genericData(this.counter === 0);
            this.pack.cards = this.data.cards;

            cacheCards.cachePack(this.data.cards);
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
            const tempBalance = this.balance - this.price[this.count];
            const tempCounter = this._calculate(this.counter - this.count, 39);
            const tempGarantS = this._calculate(this.garantS - this.count, 1800);
            this.pageModifier.updateInfo({
                balance: tempBalance,
                counter: tempCounter,
                garantS: tempGarantS
            });
            this.garantS -= this.count;
            await this.createPacks();
        }
        else {
            DLEPush.warning('Недостаточно камней духа');
        }
        $('.lootbox__open-btn-disabled').prop('disabled', false);
        $('.lootbox__open-btn-disabled').show();

    }

    _calculate(value, count) {
        return (value + count) % count || count;
    }


    genericData(garant = false) {
        this.data = {
            "cards": [...this.genericCards(garant)],
        }
    }


    createPacksConfig(garant) {
        if (garant) {
            return [{ rank: "a" }, { rank: "a" }, { rank: "a" }];
        }

        const count = bindingPack.count;

        if (count > 0) {
            let config = [{ rank: null }, { rank: null }, { rank: null }];
            const preConfig = [];
            const ids = bindingPack.ids.slice(Math.max(0, bindingPack.ids.length - count), bindingPack.ids.length);
            const pos = bindingPack.pos;

            for (let i = 0; i < count; i++) {
                if (ids[i]) {
                    preConfig.push({ id: ids[i], rank: "s" });
                    continue;
                }
                preConfig.push({ rank: "s" });
            }

            if (count > ids.length) {
                preConfig.sort(() => Math.random() - 0.5);
            }


            const isPos = pos !== null;

            let tempPos

            switch (count) {
                case 1:
                    tempPos = isPos ? pos : Math.floor(Math.random() * 3);
                    config[tempPos] = preConfig[0];
                    break;
                case 2:
                    tempPos = isPos ? pos : Math.floor(Math.random() * 3);
                    config = [preConfig[0], preConfig[1]];
                    config.splice(tempPos, 0, { rank: null });
                    break;
                case 3:
                    config[0] = preConfig[0];
                    config[1] = preConfig[1];
                    config[2] = preConfig[2];
                    break;
            }

            return config;
        }
        return [{ rank: null }, { rank: null }, { rank: null }];
    }

    genericCards(garant = false) {
        const config = this.createPacksConfig(garant);
        console.log(config);
        bindingPack.clear();
        const cards = [];
        for (let i = 0; i < 3; i++) {
            cards.push(this.genericCard(config[i]));
        }

        if (!garant && sPack) {
            const card = this.genericCard({ rank: "s" });
            const c = Math.floor(Math.random() * 3);
            cards[c] = card;
            sPack = false;
        }

        return cards;
    }

    genericCard({ rank = null, id = null }) {
        let card;
        if (id) {
            card = cacheCards.getCacheFromIds(id);
        }

        if (!card) {
            rank = rank ? rank : this._genericRandomRank();
            card = this._genericRandomCard(rank);
            card.rank = rank;
        }

        card.owned = PacksConfig.packInventory.has(card.id) ? 1 : 0;
        return card;
    }

    _genericRandomCard(rank) {
        const cards = PacksConfig.siteInventory[rank];

        const randomIndex = Math.floor(Math.random() * cards.length);

        return cards[randomIndex];
    }

    _genericRandomRank() {
        const chances = PacksConfig.chances;
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

class PageModifier {
    constructor() {
        this.injected = false;
    }

    updateInfo({ balance, counter, garantS }) {
        $('.lootbox__balance').text(balance);
        $('.lootbox__counter').text(counter);
        $('.lootbox__counter__s').text(garantS);
    }

    replaceAll() {
        this._replaceElement('.lootbox__open-btn');
        $('.lootbox__card').removeClass('lootbox__card').addClass('lootbox__card-disabled');
    }

    _replaceElement(elementSelector) {
        var $buttonCopy = $(elementSelector).clone(false);
        $(elementSelector).replaceWith($buttonCopy);
        return $buttonCopy;
    }

    modifyBuyButton() {
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
}


let packs;
let PacksPromise = null;
let lastPackTime = null;
let sPack = false;

const PacksConfig = {
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
    ],
    ids: [
        "588",
        "1545",
        "19985",
        "20182",
        "16968",
        "861",
        "70",
        "289",
        "7195",
    ]
}

class CachePack {
    constructor() {
        this.pack = [];
        this.ids = [];
    }

    cacheIds() {
        const ids = PacksConfig.ids;
        for (let i = 0; i < ids.length; i++) {
            const card = this._findCardById(ids[i]);
            this.ids.push(card || null);
        }
    }

    getCacheFromIds(id) {
        const card = this.ids.find(card => card?.id == id);
        if (card) {
            return card;
        }
        return null;
    }

    cachePack(pack) {
        this.pack = pack;
    }

    getCacheFromPack(id) {
        const card = this.pack.find(card => card?.id == id);
        if (card) {
            return card;
        }
        return null;
    }

    _findCardById(id) {
        const allCards = Object.entries(PacksConfig.siteInventory).flatMap(([rank, cards]) =>
            cards.map(card => ({ ...card, rank }))
        );
        return allCards.find(card => card.id == id);
    }
}

const cacheCards = new CachePack();

class BindingPack {
    constructor() {
        this.initialized = false
        this.pos = null
        this.count = 0
        this.ids = []
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

    bindPos(code) {
        switch (code) {
            case 'KeyQ':
                this.pos = 0;
                break;
            case 'KeyW':
                this.pos = 1;
                break;
            case 'KeyE':
                this.pos = 2;
                break;
        }
    }

    bindCount(code) {
        switch (code) {
            case 'Digit1':
                this.count = 1;
                break;
            case 'Digit2':
                this.count = 2;
                break;
            case 'Digit3':
                this.count = 3;
                break;
        }
    }

    bindClear(code) {
        switch (code) {
            case 'Digit0':
            case 'Backspace':
            case 'Escape':
                this.clear();
                break;
        }
    }

    clear() {
        this.count = 0;
        this.pos = null;
        this.ids = [];
    }

    addId(id) {
        if (this.ids.length > 2) {
            this.ids.shift();
        }
        this.ids.push(id);
    }

    bindIds(code) {
        switch (code) {
            case "KeyZ":
                this.addId(PacksConfig.ids[0]);
                break;
            case "KeyX":
                this.addId(PacksConfig.ids[1]);
                break;
            case "KeyC":
                this.addId(PacksConfig.ids[2]);
                break;
            case "KeyV":
                this.addId(PacksConfig.ids[3]);
                break;
            case "KeyB":
                this.addId(PacksConfig.ids[4]);
                break;
            case "KeyA":
                this.addId(PacksConfig.ids[5]);
                break;
            case "KeyS":
                this.addId(PacksConfig.ids[6]);
                break;
            case "KeyD":
                this.addId(PacksConfig.ids[7]);
                break;
            case "KeyF":
                this.addId(PacksConfig.ids[8]);
                break;
        }
    }

    handleKeyPress(event) {
        this.bindPos(event.code);
        this.bindCount(event.code);
        this.bindIds(event.code);
        this.bindClear(event.code);
    }
}

const bindingPack = new BindingPack();

class Inject {
    constructor() {
        this.injected = false;
        this.pageModifier = new PageModifier();
    }

    async inject() {
        if (!this.injected) {
            this._modifyPage();
            this.injected = true;
        }

        await this._setValues();
        cacheCards.cacheIds();
    }

    _modifyPage() {
        this.pageModifier.replaceAll()
        packs = new Packs();
        this.pageModifier.modifyBuyButton();
    }

    async _setValues() {
        const data = await this._loadData();
        this._loadNewConfig(data);
        this.pageModifier.updateInfo({
            balance: data.packs.balance,
            counter: data.packs.counter,
            garantS: data.packs.garantS
        });
    }

    _loadNewConfig(data) {
        if (data.packInventory) PacksConfig.packInventory = new Set(data.packInventory);
        if (data.siteInventory) PacksConfig.siteInventory = data.siteInventory;
        PacksConfig.info.balance = data.packs.balance;
        PacksConfig.info.counter = data.packs.counter;
        PacksConfig.info.garantS = data.packs.garantS;
        PacksConfig.info.cooldown = data.packs.cooldown;
        PacksConfig.ids = [
            data.packs.card1,
            data.packs.card2,
            data.packs.card3,
            data.packs.card4,
            data.packs.card5,
            data.packs.card6,
            data.packs.card7,
            data.packs.card8,
            data.packs.card9,
        ];
        PacksConfig.chances = [
            { rank: "ass", chance: data.packs.assChance },
            { rank: "s", chance: data.packs.sChance },
            { rank: "a", chance: data.packs.aChance },
            { rank: "b", chance: data.packs.bChance },
            { rank: "c", chance: data.packs.cChance },
            { rank: "d", chance: data.packs.dChance },
            { rank: "e", chance: data.packs.eChance },
        ];
    }

    async _loadData() {
        let data = await ExtensionConfig.loadConfig("dataConfig", ["packInventory", "siteInventory"]);
        data = { ...data, ...await ExtensionConfig.loadConfig("miscConfig", ["packs"]) };
        return data;
    }
}

class PacksChangerInititializer {
    constructor() {
        this.inject = new Inject();
    }

    init() {
        window.addEventListener('packs', async (event) => {
            switch (event.detail.key) {
                case 'inject':

                    await this._action();

                    const newEvent = new CustomEvent(event.detail.event, {
                        detail: {
                            id: event.detail.id,
                        },
                    });
                    window.dispatchEvent(newEvent);
                    break;
            }
        });
    }

    async _action() {
        await this.inject.inject();
        bindingPack.init();
    }
}

function init() {
    const i = new PacksChangerInititializer().init();
}

init()

