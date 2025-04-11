class ProtectedFetchService {
    static async proposeCard(cardId, type = 1) {
        let response;
        while (true) {
            response = await FetchService.proposeCard(cardId, type);
            if (!response.error) break;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return response;
    }

    static async proposeCards(cardIds, type = 1) {
        const responses = [];
        for (let i = 0; i < cardIds.length; i++) {
            const cardId = cardIds[i];
            const response = await this.proposeCard(cardId, type);
            responses.push(response);
            if (i === cardIds.length - 1) break; // Break after the last card
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        return responses;
    }
}