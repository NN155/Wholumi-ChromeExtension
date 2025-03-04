const socket = io("http://localhost:54871", { transports: ["websocket"] });

socket.on("connect", () => {
    console.log("✅ Connected to WebSocket:", socket.id);
});

socket.on("searchCards", async (data) => {
    console.log("📩 Received message:", data);

    let userName = data.name;
    let id = data.id;

    const cardsFinder = new CardsFinder({ userName, id });


    let cards;
    switch (data.action) {
        case "need":
            cards = await cardsFinder.need();
            break;
        case "trade":
            cards = await cardsFinder.trade();
            break
        case "users":
            cards = await cardsFinder.users();
            break;
        default:
            cards = {error: "Unknown action"};   
    }

    console.log("Results: ", cards)

    socket.emit("searchResults", {
        requestId: data.requestId,
        action: data.action,
        userId: id,
        userName: userName,
        result: cards,
        status: "success"
    });
});
