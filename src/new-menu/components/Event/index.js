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
        const e = new CustomEvent(event, {
            detail: {
                key: key,
                id: Date.now(),
                data: data,
                event: "button-task-completed",
                ...rest,
            },
        });
        window.dispatchEvent(e);
        await new Promise(resolve => this.promises[id] = resolve);
    }
}

export default Event;