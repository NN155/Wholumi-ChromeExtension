class FetchService {
    // get dom from url
    static async parseFetch(url) {
        let response;
        let count = 0;
        while (count < 3) {
            response = await SaveFetchService.fetch(url);
            if (response.status !== 403) {
                break;
            }
            count++;
        }
        const text = await response.text();
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(text, 'text/html');
        return htmlDocument;
    }

    // unlock card by id
    static async unlockCard(id) {
        await SaveFetchService.fetch('/engine/ajax/controller.php?mod=cards_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                mod: "cards_ajax",
                action: "lock_card",
                id: id,
            })
        })
    }

    // recieve card from server
    static async receiveCard() {
        const response = await SaveFetchService.fetch('/ajax/card_for_watch/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash
            })
        });
        const result = await response.json();
        console.log(result);
        return result;
    }

    // report card viewed
    static async reportCardViewed(owner_id) {
        const response = await SaveFetchService.fetch('/engine/ajax/controller.php?mod=cards_ajax', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                mod: "cards_ajax",
                action: "take_card",
                owner_id: owner_id,
                user_hash: dle_login_hash,
            })
        });
        const result = await response.json();
        return result;
    }

    // check if card can be taken
    static async checkTakeCard() {
        const response = await SaveFetchService.fetch("/engine/ajax/controller.php?mod=cards_ajax", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                mod: "cards_ajax",
                action: "check_take_card",
                user_hash: dle_login_hash,
            })
        });
        const data = await response.json();
        return data;
    }

    // trade with user
    static async trade({receiverId, cardId, tradeId, ids}) {
        const url = "/engine/ajax/controller.php?mod=trade_ajax";

        const creatorIds = Array.isArray(ids) ? ids : [ids];
        const body = new URLSearchParams({
            user_hash: dle_login_hash,
            action: "trade_card",
            receiver_id: receiverId,
            trade_id: tradeId,
            original_card: cardId,
        });

        creatorIds.forEach((id) => {
            body.append("creator_ids[]", id);
        });

        const response = await SaveFetchService.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: body,
        });
        return response.json();
    }

    // cancel trade by id
    static async cancelTrade(id, kind) { // kind = "sended" or "recieved"
        const url = "/engine/ajax/controller.php?mod=trade_ajax";

        const response = await SaveFetchService.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "cansel_trade",
                kind,
                id,
            }),
        });
        return response.json();
    }

    static async cancelTradeBySended(id) {
        return this.cancelTrade(id, "sended");
    }

    static async cancelTradeByRecieved(id) {
        return this.cancelTrade(id, "recieved");
    }

    //boost club card by id
    static async boostCard(cardId) {
        const url = `/club_actions/`;

        const response = await SaveFetchService.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "boost",
                card_id: cardId,
            }),
        });
        return response.json();
    }

    static async updateCardInfo(cardId) {
        const url = `/club_actions/`;

        const response = await SaveFetchService.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "boost_refresh",
                card_id: cardId,
            }),
        });
        return response.json();
    }

    static async watchAnime({
        news_id = -1,
        episode = -1,
        season = -1,
        translationId = -1,
        translationTitle = -1
    } = {}) {
        const queryParams = new URLSearchParams({
            mod: "anime_grabber",
            module: "kodik_watched",
            news_id: news_id,
            "kodik_data[episode]": episode,
            "kodik_data[season]": season,
            "kodik_data[translation][id]": translationId,
            "kodik_data[translation][title]": translationTitle,
        }).toString();

        await SaveFetchService.fetch(`/engine/ajax/controller.php?${queryParams}`)
    }

    static async rateComment({ go_rate = "plus", c_id = -1, skin = "New" } = {}) {
        const queryParams = new URLSearchParams({
            mod: "ratingcomments",
            go_rate: go_rate,
            c_id: c_id,
            skin: skin,
            user_hash: dle_login_hash,

        }).toString();

        await SaveFetchService.fetch(`/engine/ajax/controller.php?${queryParams}`)
    }

    static async remeltCard(cardIds) {
        const body = new URLSearchParams({
            user_hash: dle_login_hash,
            action: "remelt_card",
        });

        cardIds.forEach((id) => {
            body.append("card_ids[]", id);
        });

        await SaveFetchService.fetch('/engine/ajax/controller.php?mod=cards_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: body,
        });
    }
    static async proposeCard(cardId, type = 1) {
        const body = new URLSearchParams({
            user_hash: dle_login_hash,
            action: "propose_add",
            type: type,
            card_id: cardId,
        });

        const response = await SaveFetchService.fetch('/engine/ajax/controller.php?mod=trade_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: body,
        });
        return await response.json();
    }

    static async confirmTrade(id) {
        const body = new URLSearchParams({
            user_hash: dle_login_hash,
            action: "confirm_trade",
            id: id,
        });

        await SaveFetchService.fetch('/engine/ajax/controller.php?mod=trade_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: body,
        });
    }

    static async giftCode(code) {
        const response = await SaveFetchService.fetch("/engine/ajax/controller.php?mod=gift_code_game", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                code: code
            }),
        });
        return await response.json();
    }

    static async getDeck(news_id) {
        const response = await SaveFetchService.fetch("/engine/ajax/controller.php?mod=cards_ajax", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "anime_cards",
                news_id: news_id,
            }),
        });
        return await response.json();
    }

    static async showcase({ rank = "", locked = "", search = "" }) {
        const response = await SaveFetchService.fetch("/engine/ajax/controller.php?mod=cards_ajax", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "search",
                rank: rank,
                locked: locked,
                search: search,
            }),
        });
        return await response.text();
    }

    static async login({username, password}) {
        const response = await fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                login_name: username,
                login_password:password,
                login: "submit",
            }),
        });
        const result = await response.text();
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(result, 'text/html');
        return htmlDocument;
    }
}