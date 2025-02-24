class Fetch {
    // get dom from url
    static async parseFetch(url) {
        const response = await saveFetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(text, 'text/html');
        return htmlDocument;
    }

    // unlock card by id
    static async unlockCard(id) {
        await saveFetch('/engine/ajax/controller.php?mod=cards_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                mod: "cards_ajax",
                action: "lock_card",
                id: id,
            })
        })
    }

    // recieve card from server
    static async recieveCard() {
        const responce = await saveFetch('/engine/ajax/controller.php?mod=reward_card&action=check_reward&user_hash=' + dle_login_hash);
        const data = await responce.text();
        const parsedData = JSON.parse(data);
        console.log(parsedData.reason || parsedData)
        return parsedData;
    }

    // report card viewed
    static async reportCardViewed(owner_id) {
        const response = await saveFetch('/engine/ajax/controller.php?mod=cards_ajax', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
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
        const response = await saveFetch("/engine/ajax/controller.php?mod=cards_ajax", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
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
    static async tradeFetch(info, ids) {
        const url = "/engine/ajax/controller.php?mod=trade_ajax";

        const creatorIds = Array.isArray(ids) ? ids : [ids];
        const body = new URLSearchParams({
            user_hash: dle_login_hash,
            action: "trade_card",
            ...info,
        });

        creatorIds.forEach((id) => {
            body.append("creator_ids[]", id);
        });

        const response = await saveFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body,
        });
        return response.json();
    }

    // cancel trade by id
    static async cancelTrade(id, kind) { // kind = "sended" or "recieved"
        const url = "/engine/ajax/controller.php?mod=trade_ajax";

        const response = await saveFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
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
    static async boostCard(cardId, clubId) {
        const url = `/clubs/${clubId}/boost/`;

        const response = await saveFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
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
        const url = `/engine/ajax/controller.php?mod=clubs_ajax`;

        const response = await saveFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
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

        await saveFetch(`/engine/ajax/controller.php?${queryParams}`)
    }

    static async rateComment({ go_rate = "plus", c_id = -1, skin = "New" } = {}) {
        const queryParams = new URLSearchParams({
            mod: "ratingcomments",
            go_rate: go_rate,
            c_id: c_id,
            skin: skin,
            user_hash: dle_login_hash,

        }).toString();

        await saveFetch(`/engine/ajax/controller.php?${queryParams}`)
    }

    static async remeltCard(cardIds) {
        const body = new URLSearchParams({
            user_hash: dle_login_hash,
            action: "remelt_card",
        });

        cardIds.forEach((id) => {
            body.append("card_ids[]", id);
        });

        await saveFetch('/engine/ajax/controller.php?mod=cards_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });
    }
    static async proposeCard(cardId) {
        const body = new URLSearchParams({
            user_hash: dle_login_hash,
            action: "propose_add",
            type: 1,
            card_id: cardId,
        });

        const response = await saveFetch('/engine/ajax/controller.php?mod=trade_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
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

        await saveFetch('/engine/ajax/controller.php?mod=trade_ajax', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });
    }

    static async giftCode(code) {
        const response = await saveFetch("/engine/ajax/controller.php?mod=gift_code_game", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                code: code
            }),
        });
        return await response.json();
      }
}