class TradeHistoryService {
    addTrade(trade) {
        this.trades.push(trade);
    }
    
    getTrades() {
        return this.trades;
    }
}