class Semaphore {
    constructor(max = 1) {
        this.max = Math.max(1, max);
        this.count = 0;
        this.queue = [];
    }

    setMax(max) {
        this.max = Math.max(1, max); 
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

const semaphore = new Semaphore(3);

async function parseFetch(url) {

    await semaphore.acquire();

    const cachedData = loadFromLocalStorage();
    const requestCount = cachedData.length; 
    saveToLocalStorage()

    console.log(`Request count: ${requestCount}`);
    if (requestCount >= 200) {
        await new Promise(resolve => setTimeout(resolve, 1000));  
    } else if (requestCount > 100) {
        await new Promise(resolve => setTimeout(resolve, 200)); 
    } else {
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
        semaphore.release();
    }
}
