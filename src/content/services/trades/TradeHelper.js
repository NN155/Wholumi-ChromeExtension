async function tradeHelper(wantedCardId, tradedCardsIds) {
    try {
        const dom = await FetchService.parseFetch(UrlConstructor.tradeLink(wantedCardId));
        const container = dom.querySelector(".cards--container");
        const receiverId = container.getAttribute("data-receiver-id");
        const cardId = container.getAttribute("data-original-id");
        const response = await FetchService.trade({ receiverId, cardId, tradeId: wantedCardId, ids: tradedCardsIds });
        if (response.error) return {...response, success: false};
        if (response.html) return {...response, success: true};
        return {success: false, error: "Without html"}
    }
    catch (error) {
        console.log(error);
        return { error: "Error in trade", success: false };
    }
} 