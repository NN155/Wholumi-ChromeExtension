function createLi(text, onclick) {
    const li = new Li(text)
    li.onclick = onclick
    li.place(".shop__get-coins")
}


function isMyPage() {
    const url = window.location.pathname;
    const regex = /^\/user\/([^\/]+)\/$/;
    const match = url.match(regex);
    if (!match) return false;
    const nickname = match[1].toLowerCase();
    const myNickname = UrlConstructor.getMyName().toLowerCase();
    if (nickname !== myNickname) return false;
    return true;
}

function init() {
    if (!isMyPage()) return;
    createLi("Visit all urls", visitAllUrls)
}

init()

async function visitAllUrls() {
    const name = UrlConstructor.getMyName();
    const clubId = UrlConstructor.getClubId() || 1;
    const urls = [
        "/",
        `/clubs/${clubId}/`,
        "/clubs/",
        `/clubs/${clubId}/boost/`,
        `/user/${name}/watchlist/`,
        `/user/${name}/watchlist/watching/`,
        `/user/${name}/watchlist/viewed/`,
        `/user/${name}/watchlist/scheduled/`,
        `/user/${name}/watchlist/thrown/`,
        `/user/${name}/watchlist/love/`,
        `/user/${name}/watchlist/postponed/`,
        `/user/${name}/watchlist/reviewing/`,
        `/user/${name}/cards/`,
        `/user/${name}/cards_progress/`,
        `/user/${name}/cards/?rank=s`,
        `/user/${name}/cards/?rank=a`,
        `/user/${name}/cards/?rank=b`,
        `/user/${name}/cards/?rank=c`,
        `/user/${name}/cards/?rank=d`,
        `/user/${name}/cards/?rank=e`,
        "/trades/",
        "/trades/offers/",
        "/trades/history/",
        "/trades/history/?kind=calsel_sender",
        "/trades/history/?kind=calsel_reciever",
        "/cards_remelt/",
        "/cards_remelt/?rank=e",
        "/cards_remelt/?rank=d",
        "/cards_remelt/?rank=c",
        "/cards_remelt/?rank=b",
        "/cards_remelt/?rank=a",
        "/cards_showcase/",
        `/user/${name}/cards/need/`,
        `/user/${name}/cards/trade/`,
        `/user/${name}/cards/need/?rank=s`,
        `/user/${name}/cards/need/?rank=a`,
        `/user/${name}/cards/need/?rank=b`,
        `/user/${name}/cards/need/?rank=c`,
        `/user/${name}/cards/need/?rank=d`,
        `/user/${name}/cards/need/?rank=e`,
        `/user/${name}/cards/trade/?rank=s`,
        `/user/${name}/cards/trade/?rank=b`,
        `/user/${name}/cards/trade/?rank=c`,
        `/user/${name}/cards/trade/?rank=d`,
        `/user/${name}/cards/trade/?rank=e`,
        `/user/${name}/cards_created/`,
        `/user/${name}/cards_created/?rank=s`,
        `/user/${name}/cards_created/?rank=b`,
        `/user/${name}/cards_created/?rank=c`,
        `/user/${name}/cards_created/?rank=d`,
        `/user/${name}/cards_created/?rank=e`,
        `/user/${name}/decks/`,
        `/user/${name}/decks_trade/`,
        "/decks/",
        "/decks/trade/",
        `/user/${name}/`,
        `/user/${name}/friends/`,
        `/user/${name}/friends/confirmation/`,
        `/user/${name}/friends/requests/`,
        `/user/${name}/friends/blocked/`,
        "/pm/",
        "/favorites/",
        `/user/${name}/userlist/`,
        "/userlist/200/",
        "/userlist/",
        "/statistics.html",
        "/newposts/",
        "/shop/",
        "/transactions/",
        "/premium/",
        "/cards/pack/",
        "/users_top/",
        "/users_top/?kind=decks",
        "/users_top/?kind=rating",
        "/users_top/?kind=comments",
        "/users_top/?kind=meditation",
        "/?do=lastcomments",
        "/aniserials/video/action/2745-podnjatie-urovnja-v-odinochku-2-sezon-vosstante-iz-teni.html",
    ]
    await Promise.all(urls.map(url => Fetch.parseFetch(url)))
}