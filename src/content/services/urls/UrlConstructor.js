class UrlConstructor extends InventoryUrlService {

    // static methods from UserUrlService
    static get myUrl() { return UserUrlService.myUrl; }
    static set myUrl(value) { UserUrlService.myUrl = value; }
    static get myName() { return UserUrlService.myName; }
    static set myName(value) { UserUrlService.myName = value; }
    
    static getMyUrl = UserUrlService.getMyUrl;
    static getMyName = UserUrlService.getMyName;
    static getUserUrl = UserUrlService.getUserUrl;
    static getUsername = UserUrlService.getUsername;
    static isMyPage = UserUrlService.isMyPage;
    static getClubId = UserUrlService.getClubId;
    static validateUser = UserUrlService.validateUser;
    static user = UserUrlService.user;
    
    // static methods from CardUrlService
    static getCardUrl = CardUrlService.getCardUrl;
    static getCardNeedUrl = CardUrlService.getCardNeedUrl;
    static getCardTradeUrl = CardUrlService.getCardTradeUrl;
    static getCardId = CardUrlService.getCardId;
    static getCardRank = CardUrlService.getCardRank;
    static getRankBySrc = CardUrlService.getRankBySrc;
    static getCardName = CardUrlService.getCardName;
    static tradeLink = CardUrlService.tradeLink;
    static getStarsCount = CardUrlService.getStarsCount;
    
    // static methods from TradeUrlService
    static getSentLink = TradeUrlService.getSentLink;
    static getOfferLink = TradeUrlService.getOfferLink;
    static getAcceptedHistoryLink = TradeUrlService.getAcceptedHistoryLink;
    static getCancelSentHistoryLink = TradeUrlService.getCancelSentHistoryLink;
    static getCancelOfferHistoryLink = TradeUrlService.getCancelOfferHistoryLink;

    // static methods from AnimeUrlService
    static getAnimeId = AnimeUrlService.getAnimeId;
}