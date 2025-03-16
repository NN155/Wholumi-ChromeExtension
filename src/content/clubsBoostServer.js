const serverData = {
    url: "http://localhost:5358",
    isHost: false,
    isWorker: false,
}

let socket = null

function connectSocket() {
    if (socket) return;
    socket = io(serverData.url, { transports: ["websocket"] });

    socket.on("connect", () => {
        console.log("✅ Connected to WebSocket:", socket.id);
    });

    socket.on("boost-card", async (data) => {
        if (serverData.isWorker) {
            serverBoostCard.boosting(data.cardId, data.clubId);
        }
    });

    socket.on('update-page-info', (data) => {
        if (serverData.isWorker) {
            updatePageInfo(data.html, data.count, data.top)
        }
    });
}

function disconnectSocket() {
    if (!socket) return; // Якщо з'єднання вже відсутнє, нічого не робимо

    console.log("Disconnecting from WebSocket server...");
    socket.disconnect();
    socket = null;
}

function updateConnectionStatus() {
    if (serverData.isHost || serverData.isWorker) {
        connectSocket();
    } else {
        disconnectSocket();
    }
}

class ServerBoostCard {
    constructor() {
        this.isWorking = false;
    }

    async boosting(cardId, clubId) {
        if (this.isWorking) return;
        this.isWorking = true;

        try {
            const boostPromises = [];
            const { multiply } = (await ExtensionConfig.getConfig("miscConfig")).clubBoost;
            for (let i = 0; i < multiply; i++) {
                boostPromises.push(this.Boost(cardId, clubId));
            }

            await Promise.all(boostPromises);
        } catch (error) {
            console.error("Error during boosting:", error);
        } finally {
            this.isWorking = false;
        }
    }

    async Boost(cardId, clubId) {
        await Fetch.boostCard(cardId, clubId)
            .then((data) => {
                if (data.boost_html) {
                    const event = new CustomEvent("boost-success");
                    window.dispatchEvent(event);
                }
            })
    }
}

window.addEventListener("boost-card", async (event) => {
    try {
        if (serverData.isHost) {
            const data = event.detail;

            socket.emit("boost-card", {
                cardId: data.cardId,
                clubId: data.clubId,
            });
        }
    } catch (error) {
        console.error(error);
    }
});

window.addEventListener("update-page-info", async (event) => {
    try {
        if (serverData.isHost) {
            const data = event.detail;

            socket.emit("update-page-info", {
                html: data.html,
                count: data.count,
                top: data.top,
            });
        }
    } catch (error) {
        console.error(error);
    }
});

const switcherHost = new Switcher(
    {
        checked: false,
        text: "Set Host",
        onChange: (isChecked) => {
            if (isChecked) {
                serverData.isWorker = false;
                serverData.isHost = true;
                switcherWorker.turnOff()
            } else {
                serverData.isHost = false;
            }
            updateConnectionStatus();
        },
    }
)

const switcherWorker = new Switcher(
    {
        checked: false,
        text: "Set Worker",
        onChange: (isChecked) => {
            if (isChecked) {
                serverData.isWorker = true;
                serverData.isHost = false;
                switcherHost.turnOff()
            } else {
                serverData.isWorker = false;
            }
            updateConnectionStatus();
        },
    }
)

const serverBoostCard = new ServerBoostCard();

async function setConfigForServer(place = false) {
    const { clubBoost, serverBoost } = await ExtensionConfig.getConfig("functionConfig");
    const array = [{switcher: switcherHost, config: serverBoost}, {switcher: switcherWorker, config: serverBoost}];
    array.forEach(item => {
        item.switcher.display(clubBoost && item.config)
        place && item.switcher.place(".secondary-title.text-center")
    });
}

async function init() {
    await setConfigForServer(true);
}

init();

window.addEventListener('config-updated', async (event) => {
    switch (event.detail.key) {
        case "functionConfig":
            await setConfigForServer();
            break;
    }
});