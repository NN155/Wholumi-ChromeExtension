async function getDomCardRank() {
    const container = document.querySelector(".container");
    const cardUrl = container.querySelector(".secondary-title.text-center").querySelector("a").href;
    const dom = await FetchService.parseFetch(cardUrl);
    return dom;
}

function getCardInfo(dom) {
    const cardRank = dom.querySelector(".ncard__rank");
    const classList = Array.from(cardRank.classList);
    const rankClass = classList.find(cls => cls.startsWith('rank-'));
    const rank = rankClass.split('-')[1];
    
    let card = dom.querySelector(".ncard__img img")
    if (card) {
        const src = card.getAttribute("src");
        return { type: "img", rank, src };
    }
    
    card = dom.querySelector("video")
    if (card) {
        const sources = card.querySelectorAll("source");
        let webm, mp4;

        sources.forEach(source => {
            const type = source.getAttribute("type");
            const src = source.getAttribute("src");

            if (type === "video/webm") {
                webm = src;
            } else if (type === "video/mp4") {
                mp4 = src;
            }
        });
        return { type: "video", rank, webm, mp4 };
    }
}

function getUsers(dom) {
    const usersList = new UsersArray();

    let users = dom.querySelectorAll('.card-show__owner')
    if (users.length === 0) {
        users = dom.querySelectorAll(".profile__friends-item");
    };

    users.forEach(element => {
        const href = element.getAttribute("href");
        const match = href.match(/^\/user\/[^/]+\/?/);
        const userUrl = match ? match[0] : "";
        const div = element.querySelector('.profile__friends-name') || element.querySelector('.card-show__owner-name');
        const username = div.textContent;
        const lockIcon = element.querySelector('.card-show__owner-icon');
        const lock = lockIcon ? "lock" : "unlock";
        const online = element.classList.contains("card-show__owner--online")
        usersList.push(new User({username, userUrl, lock, online}));
    });
    return usersList;
}

async function getUsersList(url, { filterLock, filterOnline, limit = 200 } = {}) {
    const dom = await FetchService.parseFetch(url);
    let usersList = getUsers(dom);
    const usersPageCount = usersList.length;
    const pageLimit = Math.ceil(limit / usersPageCount);
    let pageUrls = findPanel(dom)
    if (pageUrls) {
        pageUrls = pageUrls.slice(0, pageLimit);
        const usersLists = await Promise.all(
            pageUrls.map(async (url) => {
                const dom = await FetchService.parseFetch(url);
                return getUsers(dom);
            })
        );
        usersLists.forEach(users => usersList.push(...users));
    }
    
    if (usersList.length >= limit) {
        filterLock = true;
    }

    if (filterLock) {
        usersList = usersList.getUnlockedUsers();
    }

    if (filterOnline) {
        usersList = usersList.getOnlineUsers();
    }

    if (usersList.length >= limit) {
        usersList = usersList.slice(0, limit);
    }

    return usersList;
}

async function getUsersCount(url) {
    const dom = await FetchService.parseFetch(url);
    const ownerCount = Number(dom.querySelector("#owners-count").textContent);
    const tradeCount = Number(dom.querySelector("#owners-trade").textContent);
    const needCount = Number(dom.querySelector("#owners-need").textContent);
    return {ownerCount, tradeCount, needCount};
}

function findPanel(dom) {
    const panel = dom.querySelector('.pagination__pages')
    if (panel) {
        let pageUrls = Array.from(panel.querySelectorAll(':scope > a')).map(element => element.href);
        if (pageUrls.length >= 10) {
            const lastUrl = pageUrls[pageUrls.length - 1];
            
            const regex = /(.*\?[^&]*(?:&[^&]*)*?)(?:&page=\d+)?(.*)/;
            const match = lastUrl.match(regex);
            
            if (match) {
                const baseBefore = match[1];
                const baseAfter = match[2];
                
                const pageMatch = lastUrl.match(/[?&]page=(\d+)/);
                const countPage = pageMatch ? parseInt(pageMatch[1]) : 1;

                let newPageUrls = [];
                for (let i = 2; i <= countPage; i++) {
                    newPageUrls.push(`${baseBefore}&page=${i}${baseAfter}`);
                }
                pageUrls = newPageUrls;
            }
        }
        return pageUrls;
    }
}

async function getCardTradeInfo(ownerId) {
    const url = `/cards/${ownerId}/trade`
    const dom = await FetchService.parseFetch(url);
    const tradeDiv = dom.querySelector(".cards--container");
    try {
        const info = {
            receiver: tradeDiv.getAttribute("data-receiver"),
            receiver_id: tradeDiv.getAttribute("data-receiver-id"),
            trade_id: tradeDiv.getAttribute("data-trade-id"),
            sender_foto: tradeDiv.getAttribute("data-sender-foto"),
            original_card: tradeDiv.getAttribute("data-original-id"),
        };
        return info;
    }
    catch (e) {
        console.log(e);
    }
    return false;
}

async function getActiveTrades() {
    const dom = await FetchService.parseFetch("/trades/offers/");

    const tradeItems = Array.from(dom.querySelectorAll(".trade__list-item"));
    const ids = [];
    for (const item of tradeItems) {
        let id = item.getAttribute("href").replace("/trades/offers/", "").replace("/", "");
        ids.push(id);
    }
    return ids;
}

function diamondFalls() {
    var count = 0;
    var interval = setInterval(function () {
        if (count++ >= 20) return clearInterval(interval);

        var diamond = document.createElement("div");
        diamond.className = "diamond-rating";
        diamond.style.left = (10 + Math.random() * 80) + "vw";
        document.body.appendChild(diamond);

        setTimeout(function () {
            diamond.remove();
        }, 5000);
    }, 100);
}

function createCard({ rank, name, animeName, src, id, lock, cardId, animeLink, author, mp4, webm }) {
    const card = document.createElement("div");
    card.classList = "anime-cards__item-wrapper";
    let lockDiv;
    switch (lock) {
        case "lock":
            lockDiv = `<div class="lock-trade-btn"><i class="fal fa-lock"></i></div>`;
            break;
        case "trade":
            lockDiv = `<div class="lock-trade-btn"><i class="fal fa-exchange"></i></div>`;
            break;
        case "trophy": 
            lockDiv = `<div class="lock-trade-btn"><i class="fal fa-trophy-alt"></i></div>`;
        default:
            lockDiv = "";
            break;
    }
    card.innerHTML = `
	<div class="anime-cards__item" 
        data-name="${name}" 
        data-id="${cardId}" 
        data-rank="${rank}" 
        data-anime-name="${animeName ? animeName : "Unknown"}" 
        data-anime-link="${animeLink ? animeLink : "/"}" 
        data-author="${author ? author : "Unknown"}" 
        data-image="${src ? src : ""}" 
        data-mp4="${mp4 ? mp4 : ""}"
        data-webm="${webm ? webm : ""}" 
        data-owner-id="${id}"
        data-can-trade="${lock === "unlock" ? "1" : "0"}"
        >
        
		<div class="anime-cards__image">
            <img loading="lazy" src="${src}" data-src="${src}" alt="Карточка персонажа ${name}" class="lazy-loaded">
        </div>
        ${lockDiv}
	</div>
`
    return card;
}

