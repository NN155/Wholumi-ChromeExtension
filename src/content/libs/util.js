let saveFetchConfig = {
    delay: {
        max: 10000,
        preMax: 2000,
        min: 75,
    },
    requestLimit: {
        max: 320,
        preMax: 300,
        average: 250,
        preMin: 50,
        min: 0,
    },
    threadCount: {
        max: 30,
        preMax: 10,
        preMin: 4,
        min: 1,
    }
}

class Semaphore {
    constructor(max = 1) {
        this.max = Math.max(1, max);
        this.count = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.count < this.max) {
            this.count++;
            return Promise.resolve();
        }

        return new Promise(resolve => this.queue.push(resolve));
    }

    release() {
        this.count--;
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
            this.count++;
        }
    }
}

class DynimicSemaphore extends Semaphore {
    constructor(max = 1) {
        super(max);
        this.semaphore = new Semaphore(1);
    }

    async acquire() {
        if (this.count < this.max) {
            this.count++;
            return Promise.resolve();
        }

        return new Promise(resolve => this.queue.push(resolve));
    }
    _release() {
        this.count--;
        while (this.count < this.max && this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
            this.count++;
        }
    }

    async _releaseAndControllMax() {
        await this.controllMax();
        this._release();
    }

    async release() {
        this.controllSystem(this._releaseAndControllMax.bind(this));
    }

    async controllMax() {
        const requestCount = loadFromLocalStorage().length;

        if (requestCount >= saveFetchConfig.requestLimit.preMax || requestCount >= saveFetchConfig.requestLimit.max) { // 300, 320
            this.setMax(saveFetchConfig.threadCount.min); // 1
        } else if (requestCount >= saveFetchConfig.requestLimit.average) { // 250
            this.setMax(saveFetchConfig.threadCount.preMin); // 4
        } else if (requestCount >= saveFetchConfig.requestLimit.preMin) { // 50
            this.setMax(saveFetchConfig.threadCount.preMax); // 10
        } else {
            this.setMax(saveFetchConfig.threadCount.max); // 30
        }
        if (requestCount % 5 === 0) {
            console.log(`Request count: ${requestCount}, max: ${this.max}`);
        }
    }

    setMax(max) {
        this.max = Math.max(1, max);
    }

    async controllSystem(callback) {
        await this.semaphore.acquire();

        try {
            await callback();
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            this.semaphore.release();
        }
    }
}

const dynimicSemaphore = new DynimicSemaphore(3);

async function saveFetch(url, options = {}) {
    await dynimicSemaphore.acquire();
    const requestCount = await loadFromLocalStorage().length;

    await saveToLocalStorage()
    if (requestCount >= saveFetchConfig.requestLimit.max) { // 320
        await new Promise(resolve => setTimeout(resolve, saveFetchConfig.delay.max)); // 10000
    }
    else if (requestCount >= saveFetchConfig.requestLimit.preMax) { // 300
        await new Promise(resolve => setTimeout(resolve, saveFetchConfig.delay.preMax)); // 2000
    }
    else {
        await new Promise(resolve => setTimeout(resolve, saveFetchConfig.delay.min)); // 75
    }

    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        console.error(`Error fetching:`, error);
        throw error;
    } finally {
        await dynimicSemaphore.release();
    }
}