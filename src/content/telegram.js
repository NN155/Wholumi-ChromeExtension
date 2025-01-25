class TelegramBot {
    constructor(chatId = null, botToken = null, threadId = null) {
        this.chatId = chatId;
        this.botToken = botToken;
        this.threadId = threadId;
        this.apiUrl = "https://api.telegram.org/bot";
    }

    async loadFromStorage() {
        const data = await ExtensionConfig.getConfig("telegram", ["BotInfo"]);
        const { chatId, botToken, threadId } = data.BotInfo
        this.chatId = chatId;
        this.botToken = botToken;
        this.threadId = threadId;
    }

    async sendPhotoMessage(photoUrl, caption = "") {
        return this.sendMessage('sendPhoto', {
            photo: photoUrl,
            caption: caption
        });
    }

    async sendTextMessage(text) {
        return this.sendMessage('sendMessage', {
            text: text
        });
    }

    async sendEditMediaMessage(image, caption, msg_id) {
        return this.sendMessage('editMessageMedia', {
            media: {
                type: 'photo',
                media: image,
                caption: caption
            },
            message_id: msg_id
        });
    }

    async sendEditTextMessage(text, msg_id) {
        return this.sendMessage('editMessageText', {
            text: text,
            message_id: msg_id
        });
    }
    async sendDeleteMessage(msg_id) {
        return this.sendMessage('deleteMessage', {
            message_id: msg_id
        });
    }
    async sendMessage(method, body) {
        const url = this._getUrl(method);

        body = this._getBody(body);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);

        }

        const data = await response.json();
        return data?.result?.message_id;
    }

    _getUrl(method) {
        return `${this.apiUrl}${this.botToken}/${method}`;
    }

    _getBody(data) {
        const body = {
            chat_id: this.chatId,
            message_thread_id: this.threadId,
            ...data,
        }
        return JSON.stringify(body);
    }
}

class TelegramBotWorker {
    constructor(length = 999) {
        this.cardMessageId = null;
        this.topMessagesIds = [];
        this.textSplitter = new TextSplitter(length);
    }

    async sendCardMessage(photoUrl, caption = "") {
        if (this.cardMessageId) {
            await telegramBot.sendEditMediaMessage(photoUrl, caption, this.cardMessageId)
        }
        else {
            this.cardMessageId = await telegramBot.sendPhotoMessage(photoUrl, caption);
        }
    }

    async sendTopMessages(text, imgUrl) {
        const splittedText = this.textSplitter.split(text);

        for (let i = 0; i < splittedText.length; i++) {
            if (i === 0) {
                if (this.topMessagesIds[i]) {
                    await telegramBot.sendEditMediaMessage(imgUrl, splittedText[i], this.topMessagesIds[i]);
                } else {
                    this.topMessagesIds[i] = await telegramBot.sendPhotoMessage(imgUrl, splittedText[i]);
                }
            } else {
                if (this.topMessagesIds[i]) {
                    await telegramBot.sendEditTextMessage(splittedText[i], this.topMessagesIds[i]);
                } else {
                    const messageId = await telegramBot.sendTextMessage(splittedText[i]);
                    this.topMessagesIds[i] = messageId;
                }
            }
        }
    }
}

class TextSplitter {
    constructor(length = 999) {
        this.length = length;
    }

    split(text) {
        const result = [];
        let currentText = text;
        while (currentText.length > this.length) {
            let index = currentText.lastIndexOf("\n", this.length);
            if (index === -1) {
                index = this.length;
                result.push(currentText.slice(0, index));
                currentText = currentText.slice(index);
            } else {
                result.push(currentText.slice(0, index));
                currentText = currentText.slice(index + 1);
            }
        }
        result.push(currentText);
        return result;
    }
}

class ClubUsers {
    constructor() {
        this.users = [];
    }

    add(link) {
        if (this.users[link]) {
            this.users[link]++;
        } else {
            this.users[link] = 1;
        }
    }
}

async function sendMessages() {
    cardMessageId = await telegramBot.sendPhotoMessage("https://cdn.discordapp.com/attachments/1049413127277662218/1329559532522963036/b5315a2f888ace21.png?ex=678ac84e&is=678976ce&hm=46d3a0fb4c240d1090ecaad496c13fa05bd0c2e41f151d82d15ae83b1dae7836&", " ");
    console.log('Сообщение Card отправлено, ID:', cardMessageId);
    statMessageId = await telegramBot.sendPhotoMessage("https://dere.shikimori.one/system/screenshots/original/70b604b950ab0fbb50a78c3140941478da010b33.jpg?1728155594", "Скоро начнем... ");
    console.log('Сообщение Stat отправлено, ID:', statMessageId);
}

function clubCardInfo(html) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, 'text/html');
    const src = dom.querySelector(".club-boost__image img").getAttribute("src")
    const ownerLists = dom.querySelectorAll('.club-boost__user');

    const rawLinks = [];

    ownerLists.forEach(list => {
        rawLinks.push(list.querySelector('a').getAttribute("href"));
    });

    const links = rawLinks.map(item => item.replace("/user/", "").replace("/", ""));

    return { links, src }
}

function clubStatsInfo(html) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, 'text/html');

    let usersStats = [];

    const usersStatsLists = dom.querySelectorAll('.club-boost__top-item');

    usersStatsLists.forEach(list => {
        const href = list.querySelector('a').getAttribute("href");
        const userKey = href.replace("/user/", "").replace("/", "");

        const contribution = list.closest('.club-boost__top-item').querySelector('.club-boost__top-contribution').textContent.trim();

        usersStats.push({ userName: userKey, value: Number(contribution) });
    });

    usersStats.sort((a, b) => b.value - a.value);
    return usersStats;
}

function sendCurrentStatistic() {

    // ця шляпа НЕ буде оновлювати актуальну статистику по здачі карт за день, я вліпив все в іншу функію, тому залишу цю шляпу тут на згадку




    // telegramBotEditMessage("https://dere.shikimori.one/system/screenshots/original/70b604b950ab0fbb50a78c3140941478da010b33.jpg?1728155594", resultString, 483)

}

function generateResultString(statData, data) {

    let resultString = `По итогам сегодняшней сдачи:\n\nНасчитано карт: ${CheckedCardsCount}\n\n`;

    for (let {userName: key, value} of statData) {
        let cardWord = "карт";
        if (value % 10 === 1 && value % 100 !== 11) {
            cardWord = "карту";
        } else if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) {
            cardWord = "карты";
        }

        let availableWord = "доступных";
        if (data[key] % 10 === 1 && data[key] % 100 !== 11) {
            availableWord = "доступной";
        }

        if (data.hasOwnProperty(key)) {
            resultString += `${key} - ${value} ${cardWord} из ${data[key]} ${availableWord}\n`;
        } else {
            resultString += `${key} - ${value} ${cardWord}\n`;
        }
    }

    resultString += `\n\n*Под доступными картами имеются в виду карты, которые бот смог отследить. Возможны отклонения от реальных цифр`;
    console.log(resultString);
    return resultString;
}



function sendDataStatistic(topHtml) {
    const data = clubUsers.users;

    const statData = clubStatsInfo(topHtml);

    const resultString = generateResultString(statData, data);

    const url = "https://dere.shikimori.one/system/screenshots/original/70b604b950ab0fbb50a78c3140941478da010b33.jpg?1728155594"
    telegramBotWorker.sendTopMessages(resultString, url)
}

let CheckedCardsCount = 0;
const clubUsers = new ClubUsers();

const telegramBot = new TelegramBot();
const telegramBotWorker = new TelegramBotWorker();

async function init() {
    await telegramBot.loadFromStorage();
    window.addEventListener("page-info-updated", async (event) => {
        let { src, links } = clubCardInfo(event.detail.html);
        src = "https://animestars.org" + src;

        // await telegramBotWorker.sendCardMessage(src, "Актуальная карта", cardMessageId)

        links.forEach(link => {
            clubUsers.add(link);
        });
        CheckedCardsCount += 1
        if (CheckedCardsCount % 15 === 0) {
            sendDataStatistic(event.detail.top);
        }
    });

    window.addEventListener("clubs-day-limit-reached", async(event) => {
        await new Promise(resolve => setTimeout(resolve, 1000 * 5));
        sendDataStatistic(event.detail.top);
    });
}

init();

/*
Write this code in Extension Console to save config:

let config = {
    BotInfo: {
        chatId: 12345,
        botToken: "TOKEN",
        threadId: 54321
    }
};

chrome.storage.local.set({ telegram: config }, () => {
    console.log("Config saved successfully!");
});
*/