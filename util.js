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

const semaphore = new Semaphore(1);

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
        if (requestCount >= 300) {
            this.setMax(1)
        } else if (requestCount >= 200) {
            this.setMax(3);
        } else if (requestCount >= 100) {
            this.setMax(4);
        } else if (requestCount >=  50) {
            this.setMax(10);
        } else {
            this.setMax(30);
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

async function parseFetch(url) {
    await dynimicSemaphore.acquire();
    const requestCount = loadFromLocalStorage().length;

    saveToLocalStorage()

    if (requestCount >= 300) {
        await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
    else if (requestCount >= 200) {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
    else if (requestCount > 100) {
        await new Promise(resolve => setTimeout(resolve, 500)); 
    }
    else if (requestCount > 30) {
        await new Promise(resolve => setTimeout(resolve, 300)); 
    }
    else {
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }


    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(text, 'text/html');
        return htmlDocument;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    } finally {
        await dynimicSemaphore.release();
    }
}


async function runMultipleFetches(url) {
    const fetchPromises = Array.from({ length: 500 }, () => parseFetch(url));
    try {
        const results = await Promise.all(fetchPromises);
        console.log('All 500 fetch requests completed successfully');
        return results;
    } catch (error) {
        console.error('One or more fetch requests failed:', error);
        throw error;
    }
}

// runMultipleFetches("")