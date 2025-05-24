class Event {
    static promises = {};

    static addEventListener() {
        window.addEventListener("button-task-completed", async (event) => {
            setTimeout(() => {
                const resolve = this.promises[event.detail.id];
                if (resolve) resolve();
            }, 0);
        });
    }

    static async sendEvent({ key, event, data, id, ...rest }) {
        id = id || Date.now();
        const e = new CustomEvent(event, {
            detail: {
                key: key,
                id: id,
                data: data,
                event: "button-task-completed",
                ...rest,
            },
        });
        window.dispatchEvent(e);
        await new Promise(resolve => this.promises[id] = resolve);
    }
}

Event.addEventListener();

export default Event;