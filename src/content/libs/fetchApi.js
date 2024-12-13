class Fetch{
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
    
        const response = await saveFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "trade_card",
                ...info,
                ...Object.fromEntries(
                    creatorIds.map((creatorId) => ["creator_ids[]", creatorId])
                ),
            }),
        });
        return response.json();
    }

    // cancel trade by id
    static async cancelTrade(id) {
        const url = "/engine/ajax/controller.php?mod=trade_ajax";
    
        const response = await saveFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "cansel_trade",
                kind: "sended",
                id,
            }),
        });
        return response.json();
    }

    //boost club card by id
    static async boostCard(id) {
        const url = "/engine/ajax/controller.php?mod=clubs_ajax";
    
        const response = await saveFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                user_hash: dle_login_hash,
                action: "boost",
                card_id: id,
            }),
        });
        return response.json();
    }
}
