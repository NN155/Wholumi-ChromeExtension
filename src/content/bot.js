const socket = io("http://localhost:54871", { transports: ["websocket"] });

socket.on("connect", () => {
    console.log("✅ Connected to WebSocket:", socket.id);
});

socket.on("searchCards", async (data) => {
    console.log("📩 Received message:", data);

    let userName = data.name;
    let id = data.id;

    const cardsFinder = new CardsFinder({ userName, id });

    try {
        let cards;
        switch (data.action) {
            case "need":
                cards = await cardsFinder.need();
                break;
            case "trade":
                cards = await cardsFinder.trade();
                break
            case "users":
                cardsFinder.limit = 200;
                cardsFinder.pageLimit = 7;
                cards = await cardsFinder.users();
                break;
            default:
                cards = {error: "Unknown action", taskId: data.taskId};   
        }

        cards.taskId = data.taskId;
        console.log("Results: ", cards)

        await fetch("http://localhost:54871/action/result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: data.action,
                userId: id,
                userName: userName,
                result: cards,
                status: "success",
            }),
        });
    } catch {
        await fetch("http://localhost:54871/action/result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: data.action,
                userId: id,
                userName: userName,
                result: {error: "Something went wrong", taskId: data.taskId},
                status: "success",
            }),
        });
    }
});
