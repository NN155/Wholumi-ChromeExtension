// Замість запиту використовуємо задані дані
const data = {
    "cards": {
        "cards": [
            { "id": "21003", "name": "Где Моя S", "author": "wholumulu", "news_id": "420", "rank": "e", "image": "https://animestars.org/uploads/cards_image/101/e/gde-moja-s-1729714766.webp", "approve": "1", "reward": "1", "comment": "", "new_author": "", "owned": 0 },
            { "id": "20649", "name": "Гандам Аэриал", "author": "wholumulu", "news_id": "473", "rank": "s", "image": "https://animestars.org/uploads/cards_image/1529/s/gandam-ajerial-1735080502.webp", "approve": "1", "reward": "1", "comment": "", "new_author": "", "owned": 0 },
            { "id": "14886", "name": "Акоя", "author": "wholumulu", "news_id": "468", "rank": "d", "image": "https://animestars.org/uploads/cards_image/190/d/akoja-1733687901.webp", "approve": "1", "reward": "1", "comment": "", "new_author": "", "owned": 1 }
        ],
    },
    "balance": 342,
    "counter": 24
};

const cardData = { "card": { "id": "10056", "name": "Пакунода", "poster": "/uploads/cards_image/101/d/pakunoda-1729826563.webp", "rank": "d" } }

function replaceElement(elementSelector) {
    var $buttonCopy = $(elementSelector).clone(false);
    $(elementSelector).replaceWith($buttonCopy);
    return $buttonCopy;
}

function replaceAll() {
    const buyBtn = replaceElement('.lootbox__open-btn');
    $('.lootbox__card').removeClass('lootbox__card').addClass('lootbox__card-disabled');
}

function createPack() {
    var cards_arr = data.cards.cards;
    cards_arr.forEach(function (item, index) {
        var card = document.querySelectorAll('.lootbox__card-disabled')[index];
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-rank', item.rank);
        card.querySelector('img').setAttribute('src', item.image);

        if (item.owned == 1) {
            card.classList.add('anime-cards__item', 'anime-cards__owned-by-user');
        } else {
            card.classList.remove('anime-cards__item', 'anime-cards__owned-by-user');
        }
    });

    document.querySelector('.lootbox__row').setAttribute('data-pack-id', data.cards.id);
    document.querySelector('.lootbox__row').style.display = 'block';
    document.querySelector('.lootbox__balance').textContent = data.balance;
    document.querySelector('.lootbox__counter').textContent = data.counter;
    replaceAllElements('.lootbox__card-disabled');

}

function lootCard() {
    document.querySelectorAll('.lootbox__row').forEach(row => {
        row.addEventListener('click', () => {
            row.classList.add('loot-lock');

            document.querySelectorAll('.lootbox__row').forEach(el => el.style.display = 'none');
            document.querySelector('.lootbox__card-disabled img').setAttribute('src', '/templates/New/cards_system/empty-card.png');

            openCardGiftModal(data.card.poster, data.card.name, data.card.rank);
        });
    });
}

function init() {
    replaceAll()
}



class Pack {
    constructor(cards) {
        this.cards = null;
        this.init = false
    }
    lootbox_choose() {
        if (this.init) return;
        this.init = true;
        $('body').on('click', '.lootbox__card-disabled', (event) => {  // Стрілкова функція
            var row = $(event.currentTarget).closest('.lootbox__row');
            if (row.hasClass('loot-lock') && false) {
                return false;
            }

            row.addClass('loot-lock');
            var button = $(event.currentTarget);
            var id = $(event.currentTarget).attr('data-id');
            const data = this._lootbox_choose_fetch(id);  // Викликаємо метод класу
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
                openCardGiftModal(data.card.poster, data.card.name, data.card.rank);
                row.removeClass('loot-lock');
            }
            PacksPromise();
        });
    }

    _lootbox_choose_fetch(id) {
        const cards = this.cards;
        let card = cards.find(card => card.id === id);
        return { card: { poster: card.image, name: card.name, rank: card.rank } };
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
        await new Promise(resolve => setTimeout(resolve, 100));
        if (this.balance > this.price[this.count]) {
            $('.lootbox__balance').text(this.balance - this.price[this.count]);
            $('.lootbox__counter').text((this.counter - this.count + 39) % 39 || 39);
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
            cards.push(this.genericOneCard());
        }
        return cards
    }

    genericOneCard() {
        return data.cards.cards[Math.floor(Math.random() * data.cards.cards.length)];
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
const packs = new Packs();
let PacksPromise = null;
init()
modifyBuyButton();