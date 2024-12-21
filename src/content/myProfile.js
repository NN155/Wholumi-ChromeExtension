async function watchAnime() {
    const requests = Array.from({ length: 20 }, () =>
        Fetch.watchAnime() 
    );

    await Promise.all(requests);
}

async function rateComment() {
    for (let i = 0; i < 5; i++) {
        await Fetch.rateComment()
        if(i < 4) {
            await new Promise(resolve => setTimeout(resolve, 3000))
        }
    }
}

function createLi(text, onclick) {
    const li = new Li(text)
    li.onclick = onclick
    li.place(".shop__get-coins")
} 

function init() {
    createLi("Anime: Watch nothing 20 times", watchAnime)
    createLi("Comment: Rate nothing 5 times", rateComment)
}

init()