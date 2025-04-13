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
        const cardIdsSet = Array.isArray(cardIds) ? new Set(cardIds) : cardIds;
        const responses = [];
        let i = 0;
        for (const cardId of cardIdsSet) {
            const response = await this.proposeCard(cardId, type);
            responses.push(response);
            
            if (i < cardIdsSet.size - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            i++;
        }
    
        return responses;
    }
}